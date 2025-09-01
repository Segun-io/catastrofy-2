import type { Preset, BankId } from '../types';

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'bbva_mx_preset_1',
    bankId: 'BBVA_MX',
    name: 'BBVA Preset 1 (Example)',
    locale: 'es-MX',
    defaults: {
      apr: 0.60, // 60% APR
      cycleDays: 30,
      minPaymentPercent: 0.05, // 5%
      minPaymentFloor: 200,
      interestMethod: 'averageDailyBalance',
      minPaymentFormula: 'percentPlusInterestAndFees',
      dailyRate: 0.60 / 365,
      feesPerCycle: 0
    },
    notes: 'Example only. Verify with your statement.'
  },
  {
    id: 'santander_mx_preset_1',
    bankId: 'Santander_MX',
    name: 'Santander Preset 1 (Example)',
    locale: 'es-MX',
    defaults: {
      apr: 0.55, // 55% APR
      cycleDays: 30,
      minPaymentPercent: 0.06, // 6%
      minPaymentFloor: 150,
      interestMethod: 'simpleMonthlyAPR',
      minPaymentFormula: 'percentOnly',
      dailyRate: 0.55 / 365,
      feesPerCycle: 0
    },
    notes: 'Example only. Verify with your statement.'
  },
  {
    id: 'banorte_mx_preset_1',
    bankId: 'Banorte_MX',
    name: 'Banorte Preset 1 (Example)',
    locale: 'es-MX',
    defaults: {
      apr: 0.65, // 65% APR
      cycleDays: 30,
      minPaymentPercent: 0.05, // 5%
      minPaymentFloor: 250,
      interestMethod: 'dailyCompounding',
      minPaymentFormula: 'percentPlusInterestAndFees',
      dailyRate: 0.65 / 365,
      feesPerCycle: 0
    },
    notes: 'Example only. Verify with your statement.'
  },
  {
    id: 'citibanamex_mx_preset_1',
    bankId: 'CitiBanamex_MX',
    name: 'CitiBanamex Preset 1 (Example)',
    locale: 'es-MX',
    defaults: {
      apr: 0.58, // 58% APR
      cycleDays: 30,
      minPaymentPercent: 0.07, // 7%
      minPaymentFloor: 200,
      interestMethod: 'averageDailyBalance',
      minPaymentFormula: 'percentOnly',
      dailyRate: 0.58 / 365,
      feesPerCycle: 0
    },
    notes: 'Example only. Verify with your statement.'
  },
  {
    id: 'hsbc_mx_preset_1',
    bankId: 'HSBC_MX',
    name: 'HSBC Preset 1 (Example)',
    locale: 'es-MX',
    defaults: {
      apr: 0.62, // 62% APR
      cycleDays: 30,
      minPaymentPercent: 0.05, // 5%
      minPaymentFloor: 180,
      interestMethod: 'simpleMonthlyAPR',
      minPaymentFormula: 'percentPlusInterestAndFees',
      dailyRate: 0.62 / 365,
      feesPerCycle: 0
    },
    notes: 'Example only. Verify with your statement.'
  },
  {
    id: 'scotiabank_mx_preset_1',
    bankId: 'Scotiabank_MX',
    name: 'Scotiabank Preset 1 (Example)',
    locale: 'es-MX',
    defaults: {
      apr: 0.59, // 59% APR
      cycleDays: 30,
      minPaymentPercent: 0.06, // 6%
      minPaymentFloor: 220,
      interestMethod: 'averageDailyBalance',
      minPaymentFormula: 'percentOnly',
      dailyRate: 0.59 / 365,
      feesPerCycle: 0
    },
    notes: 'Example only. Verify with your statement.'
  },
  {
    id: 'other_custom_preset',
    bankId: 'Other',
    name: 'Other (Custom)',
    locale: 'es-MX',
    defaults: {
      apr: 0.50, // 50% APR
      cycleDays: 30,
      minPaymentPercent: 0.05, // 5%
      minPaymentFloor: 200,
      interestMethod: 'averageDailyBalance',
      minPaymentFormula: 'percentPlusInterestAndFees',
      dailyRate: 0.50 / 365,
      feesPerCycle: 0
    },
    notes: 'Custom preset. Adjust values as needed.'
  }
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): Preset | undefined {
  return DEFAULT_PRESETS.find(preset => preset.id === id);
}

/**
 * Get presets by bank ID
 */
export function getPresetsByBank(bankId: BankId): Preset[] {
  return DEFAULT_PRESETS.filter(preset => preset.bankId === bankId);
}

/**
 * Get all bank IDs
 */
export function getAllBankIds(): BankId[] {
  return ['BBVA_MX', 'Santander_MX', 'Banorte_MX', 'CitiBanamex_MX', 'HSBC_MX', 'Scotiabank_MX', 'Other'];
}
