import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { MortgageCalculationResult, AmortizationRow, Prepayment } from '../lib/types/mortgage';
import { computeMortgage } from '../lib/mortgageMath';
import { 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  DollarSign, 
  Home, 
  Shield, 
  CreditCard, 
  Calculator,
  PieChart,
  Calendar,
  Target,
  Building,
  FileText,
  Settings,
  Edit3,
  RotateCcw,
  Check,
  X
} from 'lucide-react';

interface MortgageResultsProps {
  result: MortgageCalculationResult | null;
  isLoading?: boolean;
  onRecalculate?: (newResult: MortgageCalculationResult) => void;
}

export function MortgageResults({ result, isLoading, onRecalculate }: MortgageResultsProps) {
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

  const { rows, totals, input } = result;

  const handlePrepaymentChange = React.useCallback((month: number, amount: number) => {
    if (!result || !onRecalculate) return;

    // Create new prepayments array with the updated amount
    const existingPrepayments = input.prepayments || [];
    const updatedPrepayments = existingPrepayments.filter(p => p.month !== month);
    
    if (amount > 0) {
      updatedPrepayments.push({ month, amount });
    }

    // Sort prepayments by month
    updatedPrepayments.sort((a, b) => a.month - b.month);

    // Create new input with updated prepayments
    const newInput = {
      ...input,
      prepayments: updatedPrepayments
    };

    // Recalculate the mortgage
    const newResult = computeMortgage(newInput);
    
    // Create new calculation result with updated timestamp
    const newCalculationResult: MortgageCalculationResult = {
      ...result,
      input: newResult.input,
      rows: newResult.rows,
      totals: newResult.totals,
      createdAt: new Date().toISOString() // Update timestamp to reflect changes
    };

    // Persist the changes
    onRecalculate(newCalculationResult);
  }, [result, input, onRecalculate]);

  return (
    <div className="space-y-8">
      {/* Calculation Details */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xl font-semibold text-primary">
          <Settings className="h-6 w-6" />
          <h3>Parámetros del Cálculo</h3>
        </div>
        
        <Card className="border-l-4 border-l-gray-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Configuración Utilizada</span>
            </CardTitle>
            <CardDescription>
              Detalles de los parámetros aplicados en este cálculo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Información Básica</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Valor propiedad:</span>
                    <span className="text-sm font-mono">${input.propertyValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">LTV:</span>
                    <Badge variant="secondary">{(input.ltv * 100).toFixed(1)}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Principal:</span>
                    <span className="text-sm font-mono">${input.principal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tasa anual:</span>
                    <Badge variant="outline">{(input.interest.bands[0]?.annualRate * 100).toFixed(2)}%</Badge>
                  </div>
                </div>
              </div>

              {/* Terms and Product */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Términos</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Plazo:</span>
                    <Badge variant="secondary">{input.termMonths} meses</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Producto:</span>
                    <Badge variant="outline" className="capitalize">
                      {input.product === 'hipoteca_fija' && 'Hipoteca Fija'}
                      {input.product === 'hipoteca_creciente' && 'Hipoteca Creciente'}
                      {input.product === 'muda' && 'Muda'}
                      {input.product === 'remodela' && 'Remodela'}
                      {input.product === 'tu_opcion_mexico' && 'Tu Opción México'}
                      {input.product === 'terreno' && 'Terreno'}
                      {input.product === 'liquidez' && 'Liquidez'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Modo prepago:</span>
                    <Badge variant="outline" className="capitalize">
                      {input.prepaymentMode === 'reduce_term' && 'Reducir Plazo'}
                      {input.prepaymentMode === 'reduce_installment' && 'Reducir Mensualidad'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Costs */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Costos</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Comisión apertura:</span>
                    <Badge variant="secondary">{(input.costs.openingCommissionPct * 100).toFixed(2)}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avalúo:</span>
                    <span className="text-sm font-mono">${input.costs.appraisalCost.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Notario:</span>
                    <span className="text-sm font-mono">${input.costs.notaryCost.toLocaleString('es-MX')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Financial Overview */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-2xl font-bold text-primary">
          <PieChart className="h-8 w-8" />
          <h2>Resumen Financiero</h2>
        </div>
        
        {/* Primary Totals - Most Important Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2 text-blue-800">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span>Total General</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                ${totals.grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-blue-700 mt-1">Costo total del crédito</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2 text-emerald-800">
                <Home className="h-4 w-4 text-emerald-600" />
                <span>Total Principal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">
                ${totals.principalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-emerald-700 mt-1">Valor de la propiedad</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2 text-amber-800">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <span>Total de Intereses</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                ${totals.interestTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-amber-700 mt-1">Costo del financiamiento</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-violet-500 bg-gradient-to-br from-violet-50 to-violet-100/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2 text-violet-800">
                <Calculator className="h-4 w-4 text-violet-600" />
                <span>Pago por Mil</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900">
                {totals.pagoPorMil.toFixed(4)}
              </div>
              <p className="text-xs text-violet-700 mt-1">Por cada $1,000 de principal</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Costs and Fees Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xl font-semibold text-primary">
          <CreditCard className="h-6 w-6" />
          <h3>Costos y Comisiones</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Shield className="h-4 w-4 text-red-500" />
                <span>Total Seguros</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-red-700">
                ${totals.insuranceTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Vida y daños</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Settings className="h-4 w-4 text-yellow-500" />
                <span>Comisión Admin. Total</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-yellow-700">
                ${totals.adminCommissionTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Administración diferida</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Target className="h-4 w-4 text-indigo-500" />
                <span>Desembolso Inicial</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-indigo-700">
                ${totals.initialDisbursementRequired.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Enganche requerido</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Base Total - Secondary Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-lg font-medium text-muted-foreground">
          <Building className="h-5 w-5" />
          <h4>Total Base</h4>
        </div>
        
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">
                ${totals.baseTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-600 mt-2">Principal + Intereses (sin accesorios)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule Table */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xl font-semibold text-primary">
          <Calendar className="h-6 w-6" />
          <h3>Cronograma de Amortización</h3>
        </div>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Tabla de Pagos Mensuales</span>
            </CardTitle>
            <CardDescription>
              Detalle mes a mes del cronograma de pagos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentScheduleTable 
              rows={rows} 
              onPrepaymentChange={handlePrepaymentChange}
            />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function PaymentScheduleTable({ 
  rows, 
  onPrepaymentChange 
}: { 
  rows: AmortizationRow[];
  onPrepaymentChange?: (month: number, amount: number) => void;
}) {
  const [displayRows, setDisplayRows] = React.useState(12);
  const [showAll, setShowAll] = React.useState(false);
  const [editingPrepayment, setEditingPrepayment] = React.useState<number | null>(null);
  const [prepaymentValues, setPrepaymentValues] = React.useState<Record<number, string>>({});
  const [copiedMonth, setCopiedMonth] = React.useState<number | null>(null);
  const [savingMonth, setSavingMonth] = React.useState<number | null>(null);

  const visibleRows = showAll ? rows : rows.slice(0, displayRows);

  // Sync local prepayment values with actual data when rows change
  React.useEffect(() => {
    const newPrepaymentValues: Record<number, string> = {};
    rows.forEach(row => {
      if (row.prepayment > 0) {
        newPrepaymentValues[row.month] = row.prepayment.toString();
      } else {
        // Set empty string for zero values to avoid leading zeros
        newPrepaymentValues[row.month] = '';
      }
    });
    setPrepaymentValues(prev => ({ ...prev, ...newPrepaymentValues }));
  }, [rows]);

  const handlePrepaymentInputChange = (month: number, value: string) => {
    setPrepaymentValues(prev => ({
      ...prev,
      [month]: value
    }));
  };

  const handlePrepaymentBlur = (month: number) => {
    const value = prepaymentValues[month] || '';
    const numericValue = parseFloat(value) || 0;
    
    // Validation: ensure the prepayment doesn't exceed the remaining balance
    const currentRow = rows.find(r => r.month === month);
    if (currentRow && numericValue > currentRow.closingBalance) {
      // Reset to 0 if prepayment exceeds balance
      setPrepaymentValues(prev => ({
        ...prev,
        [month]: ''
      }));
      if (onPrepaymentChange) {
        setSavingMonth(month);
        onPrepaymentChange(month, 0);
        setTimeout(() => setSavingMonth(null), 1000);
      }
    } else if (onPrepaymentChange) {
      setSavingMonth(month);
      onPrepaymentChange(month, numericValue);
      setTimeout(() => setSavingMonth(null), 1000);
    }
    
    setEditingPrepayment(null);
  };

  const handlePrepaymentFocus = (month: number) => {
    setEditingPrepayment(month);
    const currentRow = rows.find(r => r.month === month);
    const currentValue = currentRow?.prepayment || 0;
    
    // Always set the current value, don't rely on cached values
    setPrepaymentValues(prev => ({
      ...prev,
      [month]: currentValue === 0 ? '' : currentValue.toString()
    }));
  };

  const handleCopyFromPrevious = (month: number) => {
    const currentIndex = rows.findIndex(r => r.month === month);
    if (currentIndex > 0) {
      const previousRow = rows[currentIndex - 1];
      const previousAmount = previousRow.prepayment;
      
      // Update the input value if currently editing
      if (editingPrepayment === month) {
        setPrepaymentValues(prev => ({
          ...prev,
          [month]: previousAmount.toString()
        }));
      } else {
        // Apply the prepayment directly
        if (onPrepaymentChange) {
          setSavingMonth(month);
          onPrepaymentChange(month, previousAmount);
          setTimeout(() => setSavingMonth(null), 1000);
        }
      }
      
      // Show success feedback
      setCopiedMonth(month);
      setTimeout(() => setCopiedMonth(null), 1000);
    }
  };

  const handleSetToZero = (month: number) => {
    // Update the input value if currently editing
    if (editingPrepayment === month) {
      setPrepaymentValues(prev => ({
        ...prev,
        [month]: ''
      }));
    } else {
      // Apply the zero prepayment directly
      if (onPrepaymentChange) {
        setSavingMonth(month);
        onPrepaymentChange(month, 0);
        setTimeout(() => setSavingMonth(null), 1000);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Mostrando {visibleRows.length} de {rows.length} pagos
        </div>
        <div className="flex space-x-2">
          {!showAll && rows.length > displayRows && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(true)}
            >
              Ver Todos ({rows.length} meses)
            </Button>
          )}
          {showAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(false)}
            >
              Ver Solo Primeros {displayRows}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-700 bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow className="border-gray-700">
                <TableHead className="font-semibold text-gray-100">Pago</TableHead>
                <TableHead className="font-semibold text-gray-100">Saldo Insoluto</TableHead>
                <TableHead className="font-semibold text-gray-100 flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-cyan-400" />
                  Pagos Anticipados
                  <span className="text-xs text-cyan-400 font-normal">(editable)</span>
                </TableHead>
                <TableHead className="font-semibold text-gray-100">Interés</TableHead>
                <TableHead className="font-semibold text-gray-100">Amortización</TableHead>
                <TableHead className="font-semibold text-gray-100">Mensualidad Base</TableHead>
                <TableHead className="font-semibold text-gray-100">Seguros</TableHead>
                <TableHead className="font-semibold text-gray-100">Com. Admin</TableHead>
                <TableHead className="font-semibold text-blue-400">Total Mensual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row, index) => (
                <TableRow 
                  key={row.month} 
                  className={`border-gray-700 ${index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/50"} hover:bg-gray-700/50 transition-colors`}
                >
                  <TableCell className="font-medium text-gray-100">
                    <Badge variant="outline" className="border-gray-600 text-gray-300 bg-gray-800">
                      {row.month}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-200">
                    ${row.openingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-cyan-400">
                    {editingPrepayment === row.month ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={prepaymentValues[row.month] || ''}
                          onChange={(e) => handlePrepaymentInputChange(row.month, e.target.value)}
                          onBlur={() => handlePrepaymentBlur(row.month)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handlePrepaymentBlur(row.month);
                            }
                            if (e.key === 'Escape') {
                              setEditingPrepayment(null);
                            }
                          }}
                          className="w-20 h-8 text-xs bg-gray-800 border-gray-600 text-cyan-400"
                          autoFocus
                          min="0"
                          max={row.closingBalance}
                          step="0.01"
                          placeholder="0"
                          title={`Máximo: $${row.closingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-cyan-400 hover:text-cyan-300"
                          onClick={() => handleCopyFromPrevious(row.month)}
                          title="Copy from previous month"
                        >
                          {copiedMonth === row.month ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          onClick={() => handleSetToZero(row.month)}
                          title="Set to zero"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div 
                          className="cursor-pointer hover:bg-gray-700/50 px-2 py-1 rounded transition-colors border border-transparent hover:border-cyan-400/30 flex items-center gap-1"
                          onClick={() => handlePrepaymentFocus(row.month)}
                          title="Click to edit prepayment amount"
                        >
                          <Edit3 className="h-3 w-3 opacity-60" />
                          ${row.prepayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          {savingMonth === row.month && (
                            <div className="ml-1 h-2 w-2 bg-green-400 rounded-full animate-pulse" title="Saving..."></div>
                          )}
                        </div>
                        {index > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-cyan-400 hover:text-cyan-300 opacity-60 hover:opacity-100"
                            onClick={() => handleCopyFromPrevious(row.month)}
                            title="Copy from previous month"
                          >
                            {copiedMonth === row.month ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <RotateCcw className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        {row.prepayment > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 opacity-60 hover:opacity-100"
                            onClick={() => handleSetToZero(row.month)}
                            title="Set to zero"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-red-400">
                    ${row.interest.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-green-400">
                    ${row.principal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-200">
                    ${row.basePayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-orange-400">
                    ${row.insurance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-yellow-400">
                    ${row.adminCommission.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-bold text-blue-300">
                    ${row.totalPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-300">Total Pagos:</span>
            <div className="font-mono text-blue-300">
              ${rows.reduce((sum, row) => sum + row.totalPayment, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-300">Total Intereses:</span>
            <div className="font-mono text-red-400">
              ${rows.reduce((sum, row) => sum + row.interest, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-300">Total Principal:</span>
            <div className="font-mono text-green-400">
              ${rows.reduce((sum, row) => sum + row.principal, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-300">Total Seguros:</span>
            <div className="font-mono text-orange-400">
              ${rows.reduce((sum, row) => sum + row.insurance, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
