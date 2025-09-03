import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { CalculationInputSchema } from '../lib/schemas';
import type { CalculationInput, Preset, InterestMethod } from '../lib/types';
import { getDailyRate } from '../lib/calculator';
import { usePresets } from '../hooks/usePresets';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { formatCurrency, formatPercentage, getLocaleLabels } from '../lib/utils/formatting';
import { ChevronDown, Info, CreditCard, Calculator, Settings, Calendar } from 'lucide-react';

interface CalculatorFormProps {
  initialValues?: Partial<CalculationInput>;
  onSubmit: (data: CalculationInput, presetId?: string) => void;
  onReset?: () => void;
  selectedPresetId?: string;
  onPresetChange?: (presetId: string | undefined) => void;
}

export function CalculatorForm({
  initialValues,
  onSubmit,
  onReset,
  selectedPresetId,
  onPresetChange
}: CalculatorFormProps) {
  const { data: presets = [] } = usePresets();
  const [lockDailyRateToAPR, setLockDailyRateToAPR] = useState(true);
  const [autoCommitEnabled, setAutoCommitEnabled] = useState(false);
  const [autoCommitTimeout, setAutoCommitTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const labels = getLocaleLabels();
  
  const form = useForm<CalculationInput>({
    resolver: valibotResolver(CalculationInputSchema),
    defaultValues: {
      principal: 32109.27, // Default to a realistic credit card balance
      apr: 0.6774, // Default to 67.74% from the statement
      dailyRate: 0.6774 / 365,
      cycleDays: 30,
      minPaymentPercent: 0.0775, // Calculated from min payment $2,250 / balance $29,056.69
      feesPerCycle: 0,
      newChargesPerCycle: 0,
      interestMethod: 'averageDailyBalance',
      minPaymentFormula: 'percentPlusInterestAndFees',
      targetMonths: 26, // Default to 26 months like bank statement
      locale: 'es-MX',
      currency: 'MXN',
      startDate: new Date().toISOString().split('T')[0],
      ...initialValues
    }
  });

  const { watch, setValue, handleSubmit, formState: { errors, isValid } } = form;
  
  const watchedValues = watch();
  const selectedPreset = presets.find(p => p.id === selectedPresetId);

  const interestMethodDescriptions: Record<InterestMethod, string> = {
    averageDailyBalance:
      'Calcula interés con el saldo promedio del ciclo. Aproximación similar a APR/12 sobre el saldo del ciclo.',
    simpleMonthlyAPR:
      'Interés simple mensual: saldo × (APR/12). No hay capitalización dentro del mes.',
    dailyCompounding:
      'Capitalización diaria: saldo × ((1 + APR/365)^{días} − 1). Generalmente produce más interés.'
  };

  const selectedInterestMethod = watchedValues.interestMethod as InterestMethod;


  // Percent-friendly UI states (displayed as 0-100%, stored as 0-1)
  const [aprPercent, setAprPercent] = useState<number>(() => Math.round((initialValues?.apr ?? 0.6774) * 100 * 1000) / 1000);
  const [minPctPercent, setMinPctPercent] = useState<number>(() => Math.round((initialValues?.minPaymentPercent ?? 0.0775) * 100 * 1000) / 1000);

  // Keep local percent display in sync when external values change
  useEffect(() => {
    if (typeof watchedValues.apr === 'number') {
      setAprPercent(Math.round(watchedValues.apr * 100 * 1000) / 1000);
    }
  }, [watchedValues.apr]);

  useEffect(() => {
    if (typeof watchedValues.minPaymentPercent === 'number') {
      setMinPctPercent(Math.round(watchedValues.minPaymentPercent * 100 * 1000) / 1000);
    }
  }, [watchedValues.minPaymentPercent]);

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));


   
   // Auto-commit functionality
  useEffect(() => {
    if (autoCommitEnabled && isValid && Object.keys(watchedValues).length > 0) {
      if (autoCommitTimeout) {
        clearTimeout(autoCommitTimeout);
      }
      
      const timeout = setTimeout(() => {
        if (isValid) {
          handleSubmit((data) => onSubmit(data, selectedPresetId))();
        }
      }, 800);
      
      setAutoCommitTimeout(timeout);
    }
    
    return () => {
      if (autoCommitTimeout) {
        clearTimeout(autoCommitTimeout);
      }
    };
  }, [watchedValues, autoCommitEnabled, isValid, selectedPresetId]);

  // Update daily rate when APR changes (if locked)
  useEffect(() => {
    if (lockDailyRateToAPR) {
      const newDailyRate = getDailyRate(watchedValues.apr, watchedValues.cycleDays);
      setValue('dailyRate', newDailyRate);
    }
  }, [watchedValues.apr, watchedValues.cycleDays, lockDailyRateToAPR, setValue]);

  // Apply preset when selected
  useEffect(() => {
    if (selectedPreset) {
      const { defaults } = selectedPreset;
      Object.entries(defaults).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as keyof CalculationInput, value);
        }
      });
    }
  }, [selectedPreset, setValue]);

  const handlePresetSelect = (presetId: string) => {
    onPresetChange?.(presetId);
  };

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data, selectedPresetId);
  });

  const handleReset = () => {
    if (selectedPreset) {
      const { defaults } = selectedPreset;
      Object.entries(defaults).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as keyof CalculationInput, value);
        }
      });
    }
    onReset?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculadora de Tarjeta de Crédito</CardTitle>
        <CardDescription>
          Calcula el interés y cronograma de pagos mínimos basado en tu estado de cuenta
        </CardDescription>
        
        
        {/* Helpful Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">¿Cómo usar con tu estado de cuenta?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Saldo de Cargos Regulares:</strong> Busca "Saldo cargos regulares" en tu estado</li>
                <li>• <strong>APR:</strong> Busca "TASA DE INTERES ANUAL VARIABLE" (divide por 100)</li>
                <li>• <strong>Pago Mínimo:</strong> Calcula: Pago mínimo ÷ Saldo = Porcentaje mínimo</li>
                <li>• <strong>Días del Ciclo:</strong> Típicamente 28-31 días (verifica en tu estado)</li>
                <li>• Selecciona el preset de tu banco para valores típicos</li>
              </ul>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Selection */}
        <div className="space-y-2">
          <Label htmlFor="preset">Preset Bancario</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedPreset ? selectedPreset.name : 'Seleccionar preset...'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[300px]">
              {presets.map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className="flex flex-col items-start space-y-1"
                >
                  <div className="font-medium">{preset.name}</div>
                  {preset.notes && (
                    <div className="text-xs text-muted-foreground">{preset.notes}</div>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Current Balance Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold text-primary">
              <CreditCard className="h-5 w-5" />
              <h3>Saldo Actual</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Principal */}
                <div className="space-y-2">
                  <Label htmlFor="principal">Saldo de Cargos Regulares</Label>
                  <Input
                    id="principal"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register('principal', {
                      valueAsNumber: true
                    })}
                    placeholder="29056.69"
                  />
                  {errors.principal && (
                    <p className="text-sm text-destructive">{errors.principal.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Saldo pendiente de pagar (sin incluir compras a meses)
                  </p>
                </div>

                              {/* APR (percent-friendly) */}
                <div className="space-y-2">
                  <Label htmlFor="aprPercent">Tasa de Interés Anual (APR)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="aprPercent"
                      type="number"
                      step="0.001"
                      min="0"
                      max="200"
                      value={aprPercent}
                      onChange={(e) => {
                        const val = clamp(Number(e.target.value), 0, 200);
                        setAprPercent(val);
                        setValue('apr', val / 100, { shouldValidate: true, shouldDirty: true });
                      }}
                      placeholder="67.74"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  {errors.apr && (
                    <p className="text-sm text-destructive">{errors.apr.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Ingresa porcentaje (ej. 67.74). Se guarda como 0.6774.
                  </p>
                </div>
            </div>


          </div>

          {/* Interest Calculation Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold text-primary">
              <Calculator className="h-5 w-5" />
              <h3>Cálculo de Interés</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Rate */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="dailyRate">{labels.dailyRate}</Label>
                  <Checkbox
                    id="lockDailyRate"
                    checked={lockDailyRateToAPR}
                    onCheckedChange={(checked) => setLockDailyRateToAPR(checked as boolean)}
                  />
                  <Label htmlFor="lockDailyRate" className="text-sm">
                    Bloquear a APR
                  </Label>
                </div>
                <Input
                  id="dailyRate"
                  type="number"
                  step="0.0001"
                  min="0"
                  disabled={lockDailyRateToAPR}
                  {...form.register('dailyRate', {
                    valueAsNumber: true
                  })}
                  placeholder="0.0019"
                />
                {errors.dailyRate && (
                  <p className="text-sm text-destructive">{errors.dailyRate.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Tasa diaria (calculada automáticamente si está bloqueada)
                </p>
              </div>

              {/* Interest Method */}
              <div className="space-y-2">
                <Label htmlFor="interestMethod">{labels.interestMethod}</Label>
                <select
                  id="interestMethod"
                  {...form.register('interestMethod')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="averageDailyBalance">Saldo Promedio Diario</option>
                  <option value="simpleMonthlyAPR">APR Mensual Simple</option>
                  <option value="dailyCompounding">Compuesto Diario</option>
                </select>
                {errors.interestMethod && (
                  <p className="text-sm text-destructive">{errors.interestMethod.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {interestMethodDescriptions[selectedInterestMethod]}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Schedule Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold text-primary">
              <Calendar className="h-5 w-5" />
              <h3>Programa de Pagos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cycle Days */}
              <div className="space-y-2">
                <Label htmlFor="cycleDays">{labels.cycleDays}</Label>
                <Input
                  id="cycleDays"
                  type="number"
                  step="1"
                  min="1"
                  max="366"
                  {...form.register('cycleDays', {
                    valueAsNumber: true
                  })}
                  placeholder="30"
                />
                {errors.cycleDays && (
                  <p className="text-sm text-destructive">{errors.cycleDays.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Días del ciclo de facturación (28-31 típico)
                </p>
              </div>

              {/* Target Months */}
              <div className="space-y-2">
                <Label htmlFor="targetMonths">Meses Objetivo para Pagar</Label>
                <Input
                  id="targetMonths"
                  type="number"
                  step="1"
                  min="1"
                  max="600"
                  {...form.register('targetMonths', {
                    valueAsNumber: true
                  })}
                  placeholder="26"
                />
                {errors.targetMonths && (
                  <p className="text-sm text-destructive">{errors.targetMonths.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Meses objetivo para pagar la deuda (26 por defecto)
                </p>
              </div>

              {/* Minimum Payment Formula */}
              <div className="space-y-2">
                <Label htmlFor="minPaymentFormula">{labels.minPaymentFormula}</Label>
                <select
                  id="minPaymentFormula"
                  {...form.register('minPaymentFormula')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="percentOnly">Solo Porcentaje</option>
                  <option value="percentPlusInterestAndFees">Porcentaje + Interés + Comisiones</option>
                </select>
                {errors.minPaymentFormula && (
                  <p className="text-sm text-destructive">{errors.minPaymentFormula.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold text-primary">
              <Settings className="h-5 w-5" />
              <h3>Detalles de Pago</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Minimum Payment Percent (percent-friendly) */}
              <div className="space-y-2">
                <Label htmlFor="minPaymentPercent">Porcentaje Mínimo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="minPaymentPercent"
                    type="number"
                    step="0.001"
                    min="0"
                    max="50"
                    value={minPctPercent}
                    onChange={(e) => {
                      const val = clamp(Number(e.target.value), 0, 50);
                      setMinPctPercent(val);
                      setValue('minPaymentPercent', val / 100, { shouldValidate: true, shouldDirty: true });
                    }}
                    placeholder="7.75"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                {errors.minPaymentPercent && (
                  <p className="text-sm text-destructive">{errors.minPaymentPercent.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Ingresa porcentaje (ej. 7.75). Se guarda como 0.0775.
                </p>
              </div>



              {/* Fees Per Cycle */}
              <div className="space-y-2">
                <Label htmlFor="feesPerCycle">{labels.feesPerCycle}</Label>
                <Input
                  id="feesPerCycle"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('feesPerCycle', {
                    valueAsNumber: true
                  })}
                  placeholder="0"
                />
                {errors.feesPerCycle && (
                  <p className="text-sm text-destructive">{errors.feesPerCycle.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Comisiones por ciclo (opcional)
                </p>
              </div>

              {/* New Charges Per Cycle */}
              <div className="space-y-2">
                <Label htmlFor="newChargesPerCycle">{labels.newChargesPerCycle}</Label>
                <Input
                  id="newChargesPerCycle"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('newChargesPerCycle', {
                    valueAsNumber: true
                  })}
                  placeholder="0"
                />
                {errors.newChargesPerCycle && (
                  <p className="text-sm text-destructive">{errors.newChargesPerCycle.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Nuevos cargos por ciclo (opcional)
                </p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800">Notas Importantes</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Los cálculos asumen que no hay nuevas compras ni adelantos en efectivo</li>
                  <li>• Se consideran pagos puntuales y tasa de interés constante</li>
                  <li>• No incluye saldos pendientes de compras diferidas a meses</li>
                  <li>• Las comisiones por anualidad o administración no están incluidas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Auto-commit toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="autoCommit"
              checked={autoCommitEnabled}
              onCheckedChange={(checked) => setAutoCommitEnabled(checked as boolean)}
            />
            <Label htmlFor="autoCommit" className="text-sm">
              Auto-confirmar después de pausa (800ms)
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">
              {labels.commit}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              {labels.reset}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Usa Ctrl/Cmd + Enter para confirmar rápidamente
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
