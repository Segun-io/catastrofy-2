import { 
  union, 
  literal, 
  object, 
  string, 
  number, 
  boolean, 
  array, 
  pipe, 
  transform, 
  minValue, 
  maxValue, 
  optional, 
  trim 
} from 'valibot';
import type { 
  BankId, 
  InterestMethod, 
  MinPaymentFormula, 
  CalculationInput, 
  PaymentScheduleItem, 
  CalculationResult, 
  Preset 
} from './types';

// Bank and method schemas
export const BankIdSchema = union([
  literal('BBVA_MX'),
  literal('Santander_MX'),
  literal('Banorte_MX'),
  literal('CitiBanamex_MX'),
  literal('HSBC_MX'),
  literal('Scotiabank_MX'),
  literal('Other')
]);

export const InterestMethodSchema = union([
  literal('averageDailyBalance'),
  literal('simpleMonthlyAPR'),
  literal('dailyCompounding')
]);

export const MinPaymentFormulaSchema = union([
  literal('percentOnly'),
  literal('percentPlusInterestAndFees')
]);

// Core calculation input schema with basic validation
export const CalculationInputSchema = object({
  principal: pipe(
    number(),
    minValue(0, 'Principal must be at least 0')
  ),
  apr: pipe(
    number(),
    minValue(0, 'APR must be at least 0%'),
    maxValue(2, 'APR cannot exceed 200%')
  ),
  dailyRate: optional(pipe(
    number(),
    minValue(0, 'Daily rate must be at least 0')
  )),
  cycleDays: pipe(
    number(),
    minValue(1, 'Cycle days must be at least 1'),
    maxValue(366, 'Cycle days cannot exceed 366')
  ),
  minPaymentPercent: pipe(
    number(),
    minValue(0, 'Minimum payment percent must be at least 0%'),
    maxValue(0.5, 'Minimum payment percent cannot exceed 50%')
  ),
  feesPerCycle: optional(pipe(
    number(),
    minValue(0, 'Fees per cycle must be at least 0')
  )),
  newChargesPerCycle: optional(pipe(
    number(),
    minValue(0, 'New charges per cycle must be at least 0')
  )),
  interestMethod: InterestMethodSchema,
  minPaymentFormula: MinPaymentFormulaSchema,
  targetMonths: optional(pipe(
    number(),
    minValue(1, 'Target months must be at least 1'),
    maxValue(600, 'Target months cannot exceed 600')
  )),
  locale: optional(string()),
  currency: optional(string()),
  startDate: optional(string())
});

// Payment schedule item schema
export const PaymentScheduleItemSchema = object({
  monthIndex: number(),
  startingBalance: number(),
  interestAccrued: number(),
  fees: number(),
  payment: number(),
  principalPaid: number(),
  endingBalance: number(),
  onlyInterestCovered: boolean()
});

// Calculation result schema
export const CalculationResultSchema = object({
  id: string(),
  name: string(),
  presetId: optional(string()),
  input: CalculationInputSchema,
  schedule: array(PaymentScheduleItemSchema),
  totals: object({
    months: number(),
    totalPaid: number(),
    totalInterest: number(),
    totalFees: number(),
    totalPrincipalPaid: number(),
    finalBalance: number()
  }),
  createdAt: string()
});

// Preset schema
export const PresetSchema = object({
  id: string(),
  bankId: BankIdSchema,
  name: string(),
  locale: optional(string()),
  defaults: object({
    apr: number(),
    cycleDays: number(),
    minPaymentPercent: number(),
    minPaymentFloor: number(),
    interestMethod: InterestMethodSchema,
    minPaymentFormula: MinPaymentFormulaSchema,
    dailyRate: optional(number()),
    feesPerCycle: optional(number())
  }),
  notes: optional(string())
});

// Storage schemas for localStorage
export const StoredCalculationsSchema = array(CalculationResultSchema);
export const StoredPresetsSchema = array(PresetSchema);
