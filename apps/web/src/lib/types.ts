export type BankId = 
  | 'BBVA_MX' 
  | 'Santander_MX' 
  | 'Banorte_MX' 
  | 'CitiBanamex_MX' 
  | 'HSBC_MX' 
  | 'Scotiabank_MX' 
  | 'Other';

export type InterestMethod = 
  | 'averageDailyBalance' 
  | 'simpleMonthlyAPR' 
  | 'dailyCompounding';

export type MinPaymentFormula = 
  | 'percentOnly' 
  | 'percentPlusInterestAndFees';

export interface CalculationInput {
  principal: number;
  apr: number; // 0-2 range for 0%-200%; store as decimal, e.g., 0.60 for 60%
  dailyRate?: number; // optional; computed from apr / 365 if omitted
  cycleDays: number; // 28-31 typical
  minPaymentPercent: number; // decimal, e.g., 0.05 for 5%
  feesPerCycle?: number;
  newChargesPerCycle?: number;
  interestMethod: InterestMethod;
  minPaymentFormula: MinPaymentFormula;
  targetMonths?: number; // Target months for payoff (default: 26)
  locale?: string; // e.g., 'es-MX'
  currency?: string; // e.g., 'MXN'
  startDate?: string; // ISO
}

export interface PaymentScheduleItem {
  monthIndex: number;
  startingBalance: number;
  interestAccrued: number;
  fees: number;
  payment: number;
  principalPaid: number;
  endingBalance: number;
  onlyInterestCovered: boolean;
}

export interface CalculationResult {
  id: string;
  name: string;
  presetId?: string;
  input: CalculationInput;
  schedule: PaymentScheduleItem[];
  totals: {
    months: number;
    totalPaid: number;
    totalInterest: number;
    totalFees: number;
    totalPrincipalPaid: number;
    finalBalance: number;
  };
  createdAt: string;
}

export interface Preset {
  id: string;
  bankId: BankId;
  name: string;
  locale?: string;
  defaults: Pick<
    CalculationInput,
    | 'apr'
    | 'cycleDays'
    | 'minPaymentPercent'
    | 'interestMethod'
    | 'minPaymentFormula'
    | 'targetMonths'
  > & { 
    dailyRate?: number; 
    feesPerCycle?: number;
  };
  notes?: string;
}
