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
  const { minPaymentPercent, minPaymentFormula } = input;
  
  let payment: number;
  
  if (minPaymentFormula === 'percentOnly') {
    // Percent-based only: percent * balance
    payment = minPaymentPercent * statementBalance;
  } else {
    // Percent + interest + fees: percent * balance + interest + fees
    payment = minPaymentPercent * statementBalance + interest + fees;
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
  
  // Calculate the optimal minimum payment to achieve target months
  // This gives us better control over the payoff timeline
  const targetMonths = input.targetMonths || 26; // Default to 26 months if not specified
  
  // Calculate the optimal payment needed to achieve target months
  // This will be adjusted dynamically based on actual progress
  const monthlyInterestRate = apr / 12;
  const basePayment = principal / targetMonths;
  const estimatedInterestPerMonth = principal * monthlyInterestRate;
  const initialOptimalPayment = basePayment + estimatedInterestPerMonth;
  
  // Track the first minimum payment amount for threshold comparison
  const firstMinPayment = computeMinimumPayment(input, principal, 0, feesPerCycle);
  const firstPaymentThreshold = firstMinPayment;
  
  while (currentBalance > 0 && monthIndex < MAX_CYCLES) {
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
    const minPayment = computeMinimumPayment(
      input,
      balanceWithCharges,
      interestAccrued,
      fees
    );
    
    // Smart payment calculation based on target months and progress
    let payment: number;
    
    if (monthIndex < targetMonths) {
      // We're still within target months - use optimal payment
      payment = Math.max(minPayment, initialOptimalPayment);
      
      // If we're behind schedule, add extra principal payment
      const remainingMonths = targetMonths - monthIndex;
      const remainingBalance = balanceWithCharges + interestAccrued + fees;
      const requiredMonthlyPayment = calculateRequiredPayment(remainingBalance, apr, remainingMonths);
      
      if (requiredMonthlyPayment > payment) {
        // Add "pago a capital" to catch up - this includes interest consideration
        payment = requiredMonthlyPayment;
      }
    } else {
      // We've exceeded target months - use minimum payment
      payment = minPayment;
    }
    
    // Calculate principal paid
    const principalPaid = payment - interestAccrued - fees;
    
    // Calculate ending balance
    const endingBalance = roundToCents(
      balanceWithCharges + interestAccrued + fees - payment
    );
    
    // Check if only interest was covered
    const onlyInterestCovered = principalPaid <= 0;
    
    // Check if this is the final payment (debt threshold reached or very small balance)
    const isFinalPayment = endingBalance <= firstPaymentThreshold * 1.1 || endingBalance <= 0.01;
    
    // For final payment, adjust payment to pay exactly the remaining balance
    let finalPayment = payment;
    let finalInterestAccrued = roundToCents(interestAccrued);
    let finalPrincipalPaid = roundToCents(principalPaid);
    
    if (isFinalPayment) {
      // Final payment should pay exactly the remaining balance (no interest)
      const remainingBalance = balanceWithCharges + fees; // No interest on final payment
      finalPayment = roundToCents(remainingBalance);
      finalInterestAccrued = 0;
      finalPrincipalPaid = roundToCents(remainingBalance - fees);
    }
    
    schedule.push({
      monthIndex,
      startingBalance: roundToCents(startingBalance),
      interestAccrued: finalInterestAccrued,
      fees: roundToCents(fees),
      payment: finalPayment,
      principalPaid: finalPrincipalPaid,
      endingBalance: isFinalPayment ? 0 : roundToCents(endingBalance), // Final payment results in zero balance
      onlyInterestCovered: isFinalPayment ? false : onlyInterestCovered // Final payment is always principal
    });
    
    currentBalance = endingBalance;
    monthIndex++;
    
    // Stop when remaining debt is approximately equal to the first payment amount (early payoff)
    // But only if we're not trying to meet a specific target months or if we're already past target
    if (endingBalance <= firstPaymentThreshold * 1.02 && (monthIndex >= targetMonths || targetMonths > 12)) {
      break;
    }
    
    // Stop when remaining debt is very small
    if (endingBalance <= 0.01) {
      break;
    }
    
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
  
  // Calculate comprehensive totals
  const totals = {
    months: schedule.length,
    totalPaid: roundToCents(schedule.reduce((sum, item) => sum + item.payment, 0)),
    totalInterest: roundToCents(schedule.reduce((sum, item) => sum + item.interestAccrued, 0)),
    totalFees: roundToCents(schedule.reduce((sum, item) => sum + item.fees, 0)),
    totalPrincipalPaid: roundToCents(schedule.reduce((sum, item) => sum + item.principalPaid, 0)),
    finalBalance: schedule.length > 0 ? schedule[schedule.length - 1].endingBalance : 0
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
 * Calculate the optimal minimum payment to achieve a target payoff timeline
 * @param principal Starting balance
 * @param apr Annual percentage rate
 * @param targetMonths Target number of months to pay off
 * @returns Optimal monthly payment amount
 */
export function calculateOptimalMinPayment(
  principal: number,
  apr: number,
  targetMonths: number
): number {
  if (targetMonths <= 0) {
    throw new Error('Target months must be positive');
  }
  
  // Calculate monthly interest rate
  const monthlyInterestRate = apr / 12;
  
  // For a target timeline, we need: principal + totalInterest = targetMonths * monthlyPayment
  // Total interest ≈ principal * monthlyInterestRate * targetMonths / 2 (average balance over time)
  const estimatedTotalInterest = principal * monthlyInterestRate * targetMonths / 2;
  
  // Optimal payment = (principal + estimatedInterest) / targetMonths
  const optimalPayment = (principal + estimatedTotalInterest) / targetMonths;
  
  return roundToCents(optimalPayment);
}

/**
 * Calculate the required payment to pay off remaining balance in remaining months
 * @param remainingBalance Current balance
 * @param apr Annual percentage rate
 * @param remainingMonths Months left to pay off
 * @returns Required monthly payment
 */
export function calculateRequiredPayment(
  remainingBalance: number,
  apr: number,
  remainingMonths: number
): number {
  if (remainingMonths <= 0) {
    return remainingBalance; // Pay everything now
  }
  
  const monthlyInterestRate = apr / 12;
  const estimatedInterest = remainingBalance * monthlyInterestRate * remainingMonths / 2;
  const requiredPayment = (remainingBalance + estimatedInterest) / remainingMonths;
  
  return roundToCents(requiredPayment);
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
