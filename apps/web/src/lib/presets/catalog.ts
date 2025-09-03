import type { Preset, BankId } from '../types';

export const DEFAULT_PRESETS: Preset[] = [
    {
        id: 'bbva_mx_statement_example',
        bankId: 'BBVA_MX',
        name: 'BBVA México (Estado de Cuenta Real)',
        locale: 'es-MX',
        defaults: {
            apr: 0.6774, // 67.74% APR from statement
            cycleDays: 31,
            minPaymentPercent: 0.05, // 7.75% from min payment $2,250 / balance $29,056.69
            interestMethod: 'simpleMonthlyAPR',
            minPaymentFormula: 'percentPlusInterestAndFees',
            targetMonths: 26, // Target months from bank statement
            dailyRate: 0.6774 / 365,
            feesPerCycle: 0
        },
        notes: 'Basado en el estado de cuenta mostrado. Balance: $29,056.69, Pago mínimo: $2,250, APR: 67.74%'
    },
    {
        id: 'bbva_mx_preset_1',
        bankId: 'BBVA_MX',
        name: 'BBVA México (Típico)',
        locale: 'es-MX',
        defaults: {
            apr: 0.60, // 60% APR typical
            cycleDays: 30,
            minPaymentPercent: 0.05, // 5% typical
            interestMethod: 'averageDailyBalance',
            minPaymentFormula: 'percentPlusInterestAndFees',
            dailyRate: 0.60 / 365,
            feesPerCycle: 0
        },
        notes: 'Valores típicos para BBVA México. Verifica con tu estado de cuenta.'
    },
    {
        id: 'santander_mx_preset_1',
        bankId: 'Santander_MX',
        name: 'Santander México (Típico)',
        locale: 'es-MX',
        defaults: {
            apr: 0.55, // 55% APR
            cycleDays: 30,
            minPaymentPercent: 0.06, // 6%
            interestMethod: 'simpleMonthlyAPR',
            minPaymentFormula: 'percentOnly',
            dailyRate: 0.55 / 365,
            feesPerCycle: 0
        },
        notes: 'Valores típicos para Santander México. Verifica con tu estado de cuenta.'
    },
    {
        id: 'banorte_mx_preset_1',
        bankId: 'Banorte_MX',
        name: 'Banorte México (Típico)',
        locale: 'es-MX',
        defaults: {
            apr: 0.65, // 65% APR
            cycleDays: 30,
            minPaymentPercent: 0.05, // 5%
            interestMethod: 'dailyCompounding',
            minPaymentFormula: 'percentPlusInterestAndFees',
            dailyRate: 0.65 / 365,
            feesPerCycle: 0
        },
        notes: 'Valores típicos para Banorte México. Verifica con tu estado de cuenta.'
    },
    {
        id: 'citibanamex_mx_preset_1',
        bankId: 'CitiBanamex_MX',
        name: 'CitiBanamex México (Típico)',
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
        notes: 'Valores típicos para CitiBanamex México. Verifica con tu estado de cuenta.'
    },
    {
        id: 'hsbc_mx_preset_1',
        bankId: 'HSBC_MX',
        name: 'HSBC México (Típico)',
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
        notes: 'Valores típicos para HSBC México. Verifica con tu estado de cuenta.'
    },
    {
        id: 'scotiabank_mx_preset_1',
        bankId: 'Scotiabank_MX',
        name: 'Scotiabank México (Típico)',
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
        notes: 'Valores típicos para Scotiabank México. Verifica con tu estado de cuenta.'
    },
    {
        id: 'other_custom_preset',
        bankId: 'Other',
        name: 'Otro (Personalizado)',
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
        notes: 'Preset personalizado. Ajusta los valores según necesites.'
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
