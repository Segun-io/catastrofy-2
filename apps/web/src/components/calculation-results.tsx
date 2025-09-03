import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { PaymentScheduleTable } from './payment-schedule-table';
import type { CalculationResult, PaymentScheduleItem } from '../lib/types';
import { formatCurrency, formatPercentage, formatAPR, getLocaleLabels } from '../lib/utils/formatting';
import { AlertTriangle, Info, TrendingUp } from 'lucide-react';

interface CalculationResultsProps {
  result: CalculationResult | null;
  isLoading?: boolean;
}

export function CalculationResults({ result, isLoading }: CalculationResultsProps) {
  const labels = getLocaleLabels();
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cargando resultados...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sin resultados</CardTitle>
          <CardDescription>
            Completa el formulario y confirma el cálculo para ver los resultados
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { schedule, totals, input } = result;
  const hasWarnings = schedule.some(item => item.onlyInterestCovered) || 
                     schedule.length >= 600 ||
                     schedule.some((item, index) => index > 0 && item.endingBalance > item.startingBalance);

  // Check for specific warning conditions
  const growingBalance = schedule.some((item, index) => index > 0 && item.endingBalance > item.startingBalance);
  const safetyCapReached = schedule.length >= 600;
  const onlyInterestCovered = schedule.some(item => item.onlyInterestCovered);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {labels.months}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.months}</div>
            <p className="text-xs text-muted-foreground">
              {totals.months === 1 ? 'mes' : 'meses'} para pagar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {labels.totalPaid}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalPaid, input.currency, input.locale)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pagado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {labels.totalInterest}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalInterest, input.currency, input.locale)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total interés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <div className="space-y-2">
          {growingBalance && (
            <Alert variant="destructive">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>{labels.warnings.growingBalance}:</strong> El pago mínimo es menor que el interés + comisiones. 
                El saldo está creciendo cada mes.
              </AlertDescription>
            </Alert>
          )}

          {safetyCapReached && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{labels.warnings.safetyCap}:</strong> Se alcanzó el límite de seguridad de 600 ciclos. 
                El cálculo se detuvo antes de que se pagara completamente.
              </AlertDescription>
            </Alert>
          )}

          {onlyInterestCovered && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{labels.warnings.onlyInterest}:</strong> En algunos meses solo se cubre el interés, 
                no se reduce el capital principal.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Payment Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma de Pagos</CardTitle>
          <CardDescription>
            Desglose mes a mes del pago mínimo y reducción del saldo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentScheduleTable 
            schedule={schedule} 
            totals={totals}
            currency={input.currency} 
            locale={input.locale}
          />
        </CardContent>
      </Card>

      {/* Calculation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Cálculo</CardTitle>
          <CardDescription>
            Parámetros utilizados para este cálculo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Saldo inicial:</span>
              <div>{formatCurrency(input.principal, input.currency, input.locale)}</div>
            </div>
            <div>
              <span className="font-medium">APR:</span>
              <div>{formatAPR(input.apr, input.locale)}</div>
            </div>
            <div>
              <span className="font-medium">Pago mínimo:</span>
              <div>{formatPercentage(input.minPaymentPercent, input.locale)}</div>
            </div>
            <div>
              <span className="font-medium">Método interés:</span>
              <div className="capitalize">
                {input.interestMethod === 'averageDailyBalance' && 'Saldo Promedio Diario'}
                {input.interestMethod === 'simpleMonthlyAPR' && 'APR Mensual Simple'}
                {input.interestMethod === 'dailyCompounding' && 'Compuesto Diario'}
              </div>
            </div>
            <div>
              <span className="font-medium">Fórmula pago:</span>
              <div className="capitalize">
                {input.minPaymentFormula === 'percentOnly' && 'Solo Porcentaje'}
                {input.minPaymentFormula === 'percentPlusInterestAndFees' && 'Porcentaje + Interés + Comisiones'}
              </div>
            </div>
            <div>
              <span className="font-medium">Días ciclo:</span>
              <div>{input.cycleDays}</div>
            </div>

            <div>
              <span className="font-medium">Comisiones:</span>
              <div>{formatCurrency(input.feesPerCycle || 0, input.currency, input.locale)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
