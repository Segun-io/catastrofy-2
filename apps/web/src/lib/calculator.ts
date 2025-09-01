import type { 
  CalculationInput, 
  PaymentScheduleItem, 
  CalculationResult,
  InterestMethod 
} from './types';

/**
 * Calculate daily rate from APR
 * @param apr Annual percentage rate (0-2 range for 0%-200%)
 * @param cycleDays Optional cycle days for custom calculation
 * @returns Daily rate as decimal
 */
export function getDailyRate(apr: number, cycleDays?: number): number {
  if (cycleDays && cycleDays !== 365) {
    // For non-standard cycles, use the cycle-specific rate
    return apr / cycleDays;
  }
  return apr / 365;
}

/**
 * Compute cycle interest based on the specified method
 * @param balance Starting balance for the cycle
 * @param apr Annual percentage rate
 * @param method Interest calculation method
 * @param cycleDays Number of days in the cycle
 * @returns Interest amount for the cycle
 */
export function computeCycleInterest(
  balance: number,
  apr: number,
  method: InterestMethod,
  cycleDays: number
): number {
  switch (method) {
    case 'averageDailyBalance':
      // Approximation: (apr / 12) * average daily balance
      // For simplicity, we use (starting + ending) / 2
      // In a real scenario, this would be the sum of daily balances
      return (apr / 12) * balance;
    
    case 'simpleMonthlyAPR':
      // Simple monthly interest: balance * (apr / 12)
      return balance * (apr / 12);
    
    case 'dailyCompounding':
      // Daily compounding: balance * ((1 + apr/365)^cycleDays - 1)
      const dailyRate = apr / 365;
      return balance * (Math.pow(1 + dailyRate, cycleDays) - 1);
    
    default:
      throw new Error(`Unknown interest method: ${method}`);
  }
}

/**
 * Compute minimum payment based on formula and balance
 * @param input Calculation input parameters
 * @param statementBalance Current statement balance
 * @param interest Interest accrued this cycle
 * @param fees Fees for this cycle
 * @returns Minimum payment amount
 */
export function computeMinimumPayment(
  input: CalculationInput,
  statementBalance: number,
  interest: number,
  fees: number
): number {
  const { minPaymentPercent, minPaymentFloor, minPaymentFormula } = input;
  
  let payment: number;
  
  if (minPaymentFormula === 'percentOnly') {
    // Percent-based only: max(floor, percent * balance)
    payment = Math.max(minPaymentFloor, minPaymentPercent * statementBalance);
  } else {
    // Percent + interest + fees: max(floor, percent * balance) + interest + fees
    payment = Math.max(minPaymentFloor, minPaymentPercent * statementBalance) + interest + fees;
  }
  
  // Ensure payment is not negative and round to cents
  return Math.max(0, Math.round(payment * 100) / 100);
}

/**
 * Round amount to cents (2 decimal places)
 * @param amount Amount to round
 * @returns Rounded amount
 */
export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Compute the complete payment schedule
 * @param input Calculation input parameters
 * @returns Array of payment schedule items
 */
export function computeSchedule(input: CalculationInput): PaymentScheduleItem[] {
  const {
    principal,
    apr,
    dailyRate: customDailyRate,
    cycleDays,
    minPaymentPercent,
    minPaymentFloor,
    feesPerCycle = 0,
    newChargesPerCycle = 0,
    interestMethod,
    minPaymentFormula
  } = input;

  const schedule: PaymentScheduleItem[] = [];
  let currentBalance = principal;
  let monthIndex = 0;
  
  // Safety cap to prevent infinite loops
  const MAX_CYCLES = 600;
  const EPSILON = 0.01; // Minimum balance to consider "paid off"
  
  while (currentBalance > EPSILON && monthIndex < MAX_CYCLES) {
    const startingBalance = currentBalance;
    
    // Add new charges before calculating interest
    const balanceWithCharges = startingBalance + newChargesPerCycle;
    
    // Calculate interest for this cycle
    const interestAccrued = computeCycleInterest(
      balanceWithCharges,
      apr,
      interestMethod,
      cycleDays
    );
    
    // Apply fees
    const fees = feesPerCycle;
    
    // Calculate minimum payment
    const payment = computeMinimumPayment(
      input,
      balanceWithCharges,
      interestAccrued,
      fees
    );
    
    // Calculate principal paid
    const principalPaid = payment - interestAccrued - fees;
    
    // Calculate ending balance
    const endingBalance = roundToCents(
      balanceWithCharges + interestAccrued + fees - payment
    );
    
    // Check if only interest was covered
    const onlyInterestCovered = principalPaid <= 0;
    
    schedule.push({
      monthIndex,
      startingBalance: roundToCents(startingBalance),
      interestAccrued: roundToCents(interestAccrued),
      fees: roundToCents(fees),
      payment: roundToCents(payment),
      principalPaid: roundToCents(principalPaid),
      endingBalance: roundToCents(endingBalance),
      onlyInterestCovered
    });
    
    currentBalance = endingBalance;
    monthIndex++;
    
    // If balance is growing and we've hit a reasonable number of cycles, stop
    if (endingBalance > startingBalance && monthIndex > 12) {
      break;
    }
  }
  
  return schedule;
}

/**
 * Create a complete calculation result
 * @param input Calculation input parameters
 * @param name Name for the calculation
 * @param presetId Optional preset ID
 * @returns Complete calculation result
 */
export function createCalculation(
  input: CalculationInput,
  name: string,
  presetId?: string
): CalculationResult {
  const schedule = computeSchedule(input);
  
  // Calculate totals
  const totals = {
    months: schedule.length,
    totalPaid: roundToCents(schedule.reduce((sum, item) => sum + item.payment, 0)),
    totalInterest: roundToCents(schedule.reduce((sum, item) => sum + item.interestAccrued, 0))
  };
  
  return {
    id: crypto.randomUUID(),
    name,
    presetId,
    input,
    schedule,
    totals,
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate a default calculation name based on input
 * @param input Calculation input
 * @returns Generated name
 */
export function generateCalculationName(input: CalculationInput): string {
  const { principal, apr, minPaymentPercent } = input;
  const aprPercent = Math.round(apr * 100);
  const minPaymentPercentDisplay = Math.round(minPaymentPercent * 100);
  
  return `${principal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} @ ${aprPercent}% APR, ${minPaymentPercentDisplay}% min`;
}
