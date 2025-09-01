import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { CalculationInputSchema } from '../lib/schemas';
import type { CalculationInput, Preset } from '../lib/types';
import { getDailyRate } from '../lib/calculator';
import { usePresets } from '../hooks/usePresets';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { formatCurrency, formatPercentage, getLocaleLabels } from '../lib/utils/formatting';
import { ChevronDown, Info } from 'lucide-react';

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
      principal: 10000,
      apr: 0.60,
      dailyRate: 0.60 / 365,
      cycleDays: 30,
      minPaymentPercent: 0.05,
      minPaymentFloor: 200,
      feesPerCycle: 0,
      newChargesPerCycle: 0,
      interestMethod: 'averageDailyBalance',
      minPaymentFormula: 'percentPlusInterestAndFees',
      locale: 'es-MX',
      currency: 'MXN',
      startDate: new Date().toISOString().split('T')[0],
      ...initialValues
    }
  });

  const { watch, setValue, handleSubmit, formState: { errors, isValid } } = form;
  
  const watchedValues = watch();
  const selectedPreset = presets.find(p => p.id === selectedPresetId);

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
          Calcula el interés y cronograma de pagos mínimos
        </CardDescription>
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

        <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-4">
          {/* Principal */}
          <div className="space-y-2">
            <Label htmlFor="principal">{labels.principal}</Label>
            <Input
              id="principal"
              type="number"
              step="0.01"
              min="0"
              {...form.register('principal')}
              placeholder="10000"
            />
            {errors.principal && (
              <p className="text-sm text-destructive">{errors.principal.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Saldo inicial de la tarjeta
            </p>
          </div>

          {/* APR */}
          <div className="space-y-2">
            <Label htmlFor="apr">{labels.apr}</Label>
            <Input
              id="apr"
              type="number"
              step="0.01"
              min="0"
              max="2"
              {...form.register('apr')}
              placeholder="0.60"
            />
            {errors.apr && (
              <p className="text-sm text-destructive">{errors.apr.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Tasa anual (0.60 = 60%)
            </p>
          </div>

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
              {...form.register('dailyRate')}
              placeholder="0.0016"
            />
            {errors.dailyRate && (
              <p className="text-sm text-destructive">{errors.dailyRate.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Tasa diaria (calculada automáticamente si está bloqueada)
            </p>
          </div>

          {/* Cycle Days */}
          <div className="space-y-2">
            <Label htmlFor="cycleDays">{labels.cycleDays}</Label>
            <Input
              id="cycleDays"
              type="number"
              step="1"
              min="1"
              max="366"
              {...form.register('cycleDays')}
              placeholder="30"
            />
            {errors.cycleDays && (
              <p className="text-sm text-destructive">{errors.cycleDays.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Días del ciclo de facturación (28-31 típico)
            </p>
          </div>

          {/* Minimum Payment Percent */}
          <div className="space-y-2">
            <Label htmlFor="minPaymentPercent">{labels.minPaymentPercent}</Label>
            <Input
              id="minPaymentPercent"
              type="number"
              step="0.001"
              min="0"
              max="0.5"
              {...form.register('minPaymentPercent')}
              placeholder="0.05"
            />
            {errors.minPaymentPercent && (
              <p className="text-sm text-destructive">{errors.minPaymentPercent.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Porcentaje mínimo (0.05 = 5%)
            </p>
          </div>

          {/* Minimum Payment Floor */}
          <div className="space-y-2">
            <Label htmlFor="minPaymentFloor">{labels.minPaymentFloor}</Label>
            <Input
              id="minPaymentFloor"
              type="number"
              step="0.01"
              min="0"
              {...form.register('minPaymentFloor')}
              placeholder="200"
            />
            {errors.minPaymentFloor && (
              <p className="text-sm text-destructive">{errors.minPaymentFloor.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Piso mínimo del pago
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
              {...form.register('feesPerCycle')}
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
              {...form.register('newChargesPerCycle')}
              placeholder="0"
            />
            {errors.newChargesPerCycle && (
              <p className="text-sm text-destructive">{errors.newChargesPerCycle.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Nuevos cargos por ciclo (opcional)
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

          {/* Auto-commit toggle */}
          <div className="flex items-center space-x-2">
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
