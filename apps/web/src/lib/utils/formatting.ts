import type { CalculationInput } from '../types';

/**
 * Format currency amount according to locale and currency
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'MXN', 
  locale: string = 'es-MX'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage according to locale
 */
export function formatPercentage(
  value: number, 
  locale: string = 'es-MX',
  decimals: number = 1
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format decimal number according to locale
 */
export function formatDecimal(
  value: number, 
  locale: string = 'es-MX',
  decimals: number = 4
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format APR for display (convert from decimal to percentage)
 */
export function formatAPR(apr: number, locale: string = 'es-MX'): string {
  return formatPercentage(apr, locale, 1);
}

/**
 * Format minimum payment percentage for display
 */
export function formatMinPaymentPercent(percent: number, locale: string = 'es-MX'): string {
  return formatPercentage(percent, locale, 1);
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: string | Date, 
  locale: string = 'es-MX',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: string | Date, 
  locale: string = 'es-MX'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays > 0) {
    return `${diffInDays} día${diffInDays > 1 ? 's' : ''} atrás`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''} atrás`;
  } else {
    return 'Justo ahora';
  }
}

/**
 * Get locale-specific labels
 */
export function getLocaleLabels(locale: string = 'es-MX'): Record<string, any> {
  if (locale.startsWith('es')) {
    return {
      principal: 'Saldo inicial',
      apr: 'Tasa anual (APR)',
      dailyRate: 'Tasa diaria',
      cycleDays: 'Días del ciclo',
      minPaymentPercent: 'Porcentaje pago mínimo',
      minPaymentFloor: 'Piso pago mínimo',
      feesPerCycle: 'Comisiones por ciclo',
      newChargesPerCycle: 'Nuevos cargos por ciclo',
      interestMethod: 'Método de interés',
      minPaymentFormula: 'Fórmula pago mínimo',
      interestAccrued: 'Interés generado',
      payment: 'Pago',
      principalPaid: 'Capital pagado',
      endingBalance: 'Saldo final',
      onlyInterestCovered: 'Solo interés cubierto',
      months: 'Meses',
      totalPaid: 'Total pagado',
      totalInterest: 'Total interés',
      current: 'Actual',
      commit: 'Confirmar cálculo',
      reset: 'Restablecer',
      delete: 'Eliminar',
      duplicate: 'Duplicar',
      clearAll: 'Limpiar todo',
      jumpToCurrent: 'Ir al actual',
      warnings: {
        growingBalance: 'El saldo está creciendo',
        safetyCap: 'Límite de seguridad alcanzado',
        onlyInterest: 'Solo se cubre el interés'
      }
    };
  }
  
  // Default English labels
  return {
    principal: 'Starting Balance',
    apr: 'Annual Rate (APR)',
    dailyRate: 'Daily Rate',
    cycleDays: 'Cycle Days',
    minPaymentPercent: 'Minimum Payment %',
    minPaymentFloor: 'Minimum Payment Floor',
    feesPerCycle: 'Fees per Cycle',
    newChargesPerCycle: 'New Charges per Cycle',
    interestMethod: 'Interest Method',
    minPaymentFormula: 'Min Payment Formula',
    interestAccrued: 'Interest Accrued',
    payment: 'Payment',
    principalPaid: 'Principal Paid',
    endingBalance: 'Ending Balance',
    onlyInterestCovered: 'Only Interest Covered',
    months: 'Months',
    totalPaid: 'Total Paid',
    totalInterest: 'Total Interest',
    current: 'Current',
    commit: 'Commit Calculation',
    reset: 'Reset',
    delete: 'Delete',
    duplicate: 'Duplicate',
    clearAll: 'Clear All',
    jumpToCurrent: 'Jump to Current',
    warnings: {
      growingBalance: 'Balance is growing',
      safetyCap: 'Safety cap reached',
      onlyInterest: 'Only interest covered'
    }
  };
}
