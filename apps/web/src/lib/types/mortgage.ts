export type ProductType =
  | 'hipoteca_fija'
  | 'hipoteca_creciente'
  | 'muda'
  | 'remodela'
  | 'tu_opcion_mexico'
  | 'terreno'
  | 'liquidez';

export type InterestBand = {
  fromMonth: number; // 1-based inclusive
  toMonth?: number; // inclusive; if omitted, applies to end
  annualRate: number; // e.g., 0.101 for 10.10%
};

export type InsuranceSettings = {
  lifeAnnualRateOnBalance: number; // e.g., 0.0072 (0.72%/yr)
  hazardAnnualRateOnInsuredValue: number; // e.g., 0.0023 (0.23%/yr)
  insuredValueFactor: number; // portion of property insured (1, or 0.8 if exclude land)
  reindexInsuredValueAnnualPct: number; // annual reindexing of insured value (0–0.1)
};

export type CostSettings = {
  openingCommissionPct: number; // one-time on principal, e.g., 0.01
  adminDeferredMonthlyPct: number; // monthly pct on original principal, e.g., 0.00008
  appraisalCost: number;
  notaryCost: number;
  preoriginationCost: number;
};

export type Prepayment = {
  month: number; // 1..termMonths
  amount: number; // MXN
};

export type PrepaymentMode = 'reduce_term' | 'reduce_installment';

export type GrowthSettings = {
  annualIncreasePct: number; // e.g., 0.022 for 2.2%
  increaseEndYear: number; // e.g., 14
  initialPagoPorMil?: number; // optional, used to seed month-1 base in creciente
};

export type MortgageInput = {
  product: ProductType;
  propertyValue: number; // MXN
  ltv: number; // 0..1
  principal?: number; // overrides propertyValue*ltv if provided
  termMonths: number; // 60..240 typical
  interest: { bands: InterestBand[] }; // for fija: one band
  growth?: GrowthSettings; // only for creciente
  costs: CostSettings;
  insurance: InsuranceSettings;
  prepayments: Prepayment[];
  prepaymentMode: PrepaymentMode;
  startDate?: string; // ISO date, optional
  roundingMode?: 'round' | 'floor' | 'ceil';
};

export type AmortizationRow = {
  month: number;
  date?: string;
  openingBalance: number;
  interest: number;
  principal: number;
  basePayment: number; // capital + interest
  insurance: number; // vida + daños
  adminCommission: number; // autorización diferida
  totalPayment: number; // base + insurance + admin
  prepayment: number;
  closingBalance: number;
};

export type AmortizationTotals = {
  interestTotal: number;
  principalTotal: number;
  baseTotal: number;
  insuranceTotal: number;
  adminCommissionTotal: number;
  grandTotal: number;
  pagoPorMil: number;
  initialDisbursementRequired: number;
  openingCommission: number;
  downPayment: number;
};

export type MortgageResult = {
  input: Required<MortgageInput> & { principal: number };
  rows: AmortizationRow[];
  totals: AmortizationTotals;
};
