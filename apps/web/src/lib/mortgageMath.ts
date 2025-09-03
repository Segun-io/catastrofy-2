import type {
  AmortizationRow,
  InterestBand,
  MortgageInput,
  MortgageResult,
} from './types/mortgage';

const round2 = (v: number, mode: 'round' | 'floor' | 'ceil' = 'round') => {
  const f = Math.pow(10, 2);
  if (mode === 'floor') return Math.floor(v * f) / f;
  if (mode === 'ceil') return Math.ceil(v * f) / f;
  return Math.round(v * f) / f;
};

const getMonthlyRateForMonth = (bands: InterestBand[], m: number) => {
  const b = bands.find(
    (x) => m >= x.fromMonth && (x.toMonth === undefined || m <= x.toMonth)
  );
  const annual = b ? b.annualRate : bands[bands.length - 1].annualRate;
  return annual / 12;
};

// Standard annuity payment
const annuity = (pv: number, r: number, n: number) => {
  if (r === 0) return pv / n;
  return (pv * r) / (1 - Math.pow(1 + r, -n));
};

type BuildBasePaymentFn = (args: {
  month: number;
  principal0: number;
  termMonths: number;
  input: Required<MortgageInput>;
  balanceSoFar: number;
}) => number;

const buildFixedBasePayment: BuildBasePaymentFn = ({
  month,
  principal0,
  termMonths,
  input,
}) => {
  const r = getMonthlyRateForMonth(input.interest.bands, 1);
  return annuity(principal0, r, termMonths);
};

// Increasing plan:
// - Up to increaseEndYear: base grows annually by growthPct.
// - After that, recompute a fixed payment to amortize remaining balance.
const makeIncreasingBasePayment = (params: {
  input: Required<MortgageInput>;
  principal0: number;
  termMonths: number;
}) => {
  const { input, principal0, termMonths } = params;
  const g = input.growth!;
  const monthsOfGrowth = Math.min(
    termMonths,
    g.increaseEndYear * 12
  );

  const initialBase = g.initialPagoPorMil
    ? (principal0 / 1000) * g.initialPagoPorMil
    : // Fallback: compute a fixed annuity and start a bit lower (90%),
      // caller can tune with initialPagoPorMil.
      buildFixedBasePayment({
        month: 1,
        principal0,
        termMonths,
        input,
        balanceSoFar: principal0,
      }) * 0.9;

  // Precompute the per-year multiplier
  const baseForMonthBeforeFix = (m: number) => {
    const yearIndex = Math.floor((m - 1) / 12); // 0-based
    const factor =
      m <= monthsOfGrowth ? Math.pow(1 + g.annualIncreasePct, yearIndex) : 1;
    return initialBase * factor;
  };

  return {
    monthsOfGrowth,
    initialBase,
    baseForMonthBeforeFix,
  };
};

export const computeMortgage = (
  rawInput: MortgageInput
): MortgageResult => {
  // Fill defaults and derive principal
  const input: Required<MortgageInput> = {
    roundingMode: rawInput.roundingMode ?? 'round',
    startDate: rawInput.startDate ?? '',
    prepaymentMode: rawInput.prepaymentMode,
    prepayments: rawInput.prepayments ?? [],
    insurance: rawInput.insurance,
    costs: rawInput.costs,
    interest: rawInput.interest,
    growth: rawInput.growth ?? {
      annualIncreasePct: 0,
      increaseEndYear: 0,
      initialPagoPorMil: undefined,
    },
    ltv: rawInput.ltv,
    product: rawInput.product,
    propertyValue: rawInput.propertyValue,
    termMonths: rawInput.termMonths,
    principal:
      rawInput.principal ??
      round2(rawInput.propertyValue * rawInput.ltv, 'round'),
  };

  const rounding = input.roundingMode;
  const P0 = input.principal;
  const n = input.termMonths;

  const downPayment = round2(input.propertyValue - P0, rounding);
  const openingCommission = round2(
    P0 * input.costs.openingCommissionPct,
    rounding
  );
  const initialDisbursementRequired = round2(
    downPayment +
      input.costs.notaryCost +
      input.costs.appraisalCost +
      input.costs.preoriginationCost +
      openingCommission,
    rounding
  );

  const monthlyAdminCommission = round2(
    P0 * input.costs.adminDeferredMonthlyPct,
    rounding
  );

  // Build base payment function
  let basePaymentFn: (m: number, balance: number) => number;

  if (input.product === 'hipoteca_creciente') {
    const inc = makeIncreasingBasePayment({
      input,
      principal0: P0,
      termMonths: n,
    });

    // First pass until growth ends; we will recompute a fixed base after that.
    // We'll simulate in one pass, but when we reach the first month after
    // growth, we compute the remaining fixed payment.
    let fixedBaseAfterGrowth: number | null = null;

    basePaymentFn = (m: number, _balance: number) => {
      if (m <= inc.monthsOfGrowth) {
        return inc.baseForMonthBeforeFix(m);
      }
      if (fixedBaseAfterGrowth != null) return fixedBaseAfterGrowth;
      // fixedBaseAfterGrowth will be determined on the fly in compute loop
      // once we know remaining balance. Placeholder here; the main loop
      // will overwrite it when needed.
      return 0;
    };

    // Attach helper to compute the fixed base after growth
    (basePaymentFn as any).__computeFixedAfterGrowth = (
      remainingBalance: number,
      fromMonth: number
    ) => {
      const monthsLeft = n - (fromMonth - 1);
      const r = getMonthlyRateForMonth(input.interest.bands, fromMonth);
      const mFixed = annuity(remainingBalance, r, monthsLeft);
      fixedBaseAfterGrowth = mFixed;
      return mFixed;
    };
  } else {
    const fixedBase = buildFixedBasePayment({
      month: 1,
      principal0: P0,
      termMonths: n,
      input,
      balanceSoFar: P0,
    });
    basePaymentFn = () => fixedBase;
  }

  // Prepayment map for O(1)
  const prepayByMonth = new Map<number, number>();
  for (const p of input.prepayments) {
    prepayByMonth.set(p.month, (prepayByMonth.get(p.month) ?? 0) + p.amount);
  }

  const rows: AmortizationRow[] = [];
  let balance = P0;
  let interestTotal = 0;
  let baseTotal = 0;
  let insuranceTotal = 0;
  let adminTotal = 0;

  for (let m = 1; m <= n && balance > 0.005; m++) {
    let base = basePaymentFn(m, balance);

    // If creciente and we are past growth without a fixed base yet, set it
    if (
      input.product === 'hipoteca_creciente' &&
      input.growth &&
      m === input.growth.increaseEndYear * 12 + 1
    ) {
      const computeFixed = (basePaymentFn as any)
        .__computeFixedAfterGrowth as (rem: number, from: number) => number;
      base = computeFixed(balance, m);
    }

    const r = getMonthlyRateForMonth(input.interest.bands, m);
    let interest = balance * r;
    let principal = base - interest;

    // Guard against negative principal due to bad config
    if (principal < 0 && m <= n) {
      throw new Error(
        `Base payment too small at month ${m}. Increase initial pago por ` +
          `mil or growth/base settings.`
      );
    }

    // Last installment adjustment
    if (principal > balance) {
      principal = balance;
      base = interest + principal;
    }

    // Insurance
    const yearIndex = Math.floor((m - 1) / 12);
    const insuredValue =
      input.propertyValue *
      input.insurance.insuredValueFactor *
      Math.pow(1 + input.insurance.reindexInsuredValueAnnualPct, yearIndex);

    const life = (balance * input.insurance.lifeAnnualRateOnBalance) / 12;
    const hazard =
      (insuredValue * input.insurance.hazardAnnualRateOnInsuredValue) / 12;

    let insurance = life + hazard;

    // Rounding
    interest = round2(interest, rounding);
    principal = round2(principal, rounding);
    base = round2(base, rounding);
    insurance = round2(insurance, rounding);
    const admin = monthlyAdminCommission;

    // Apply prepayment after regular principal
    let prepayment = round2(prepayByMonth.get(m) ?? 0, rounding);
    if (prepayment > 0) {
      if (prepayment > balance - principal) {
        prepayment = round2(balance - principal, rounding);
      }
    }

    let closing = round2(balance - principal - prepayment, rounding);

    // If reduce_installment, recompute base for remaining months
    if (prepayment > 0 && input.prepaymentMode === 'reduce_installment') {
      const monthsLeft = n - m;
      if (monthsLeft > 0) {
        const rNext = getMonthlyRateForMonth(input.interest.bands, m + 1);
        const newBase = annuity(closing, rNext, monthsLeft);
        if (input.product === 'hipoteca_creciente') {
          // After a prepayment, creciente switches to fixed base from next month
          (basePaymentFn as any).__computeFixedAfterGrowth =
            (_rem: number, _from: number) => newBase;
        } else {
          // Fixed product: replace base from next month
          basePaymentFn = () => newBase;
        }
      }
    }

    const totalPayment = round2(base + insurance + admin + prepayment, rounding);

    rows.push({
      month: m,
      openingBalance: balance,
      interest,
      principal,
      basePayment: base,
      insurance,
      adminCommission: admin,
      totalPayment,
      prepayment,
      closingBalance: closing,
    });

    balance = closing;
    interestTotal += interest;
    baseTotal += base;
    insuranceTotal += insurance;
    adminTotal += admin;
  }

  // If reduce_term, months may be less than n; admin commission only for
  // months actually paid (rows.length).
  const adminCommissionTotal = round2(
    input.costs.adminDeferredMonthlyPct === 0
      ? 0
      : input.costs.adminDeferredMonthlyPct * input.principal * rows.length,
    rounding
  );

  const pagoPorMil =
    rows.length > 0
      ? round2(
          (rows[0].basePayment / (P0 / 1000)),
          'round'
        )
      : 0;

  const totals = {
    interestTotal: round2(interestTotal, rounding),
    principalTotal: round2(P0, rounding),
    baseTotal: round2(baseTotal, rounding),
    insuranceTotal: round2(insuranceTotal, rounding),
    adminCommissionTotal: round2(adminTotal, rounding),
    grandTotal: round2(baseTotal + insuranceTotal + adminTotal, rounding),
    pagoPorMil,
    initialDisbursementRequired,
    openingCommission,
    downPayment,
  };

  return {
    input,
    rows,
    totals,
  };
};
