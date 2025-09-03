import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { mortgageSchema } from '../lib/schemas/mortgageSchema';
import type { MortgageInput } from '../lib/types/mortgage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Home, Calculator, Settings, Shield, CreditCard, Info } from 'lucide-react';

interface MortgageFormProps {
  initialValues?: Partial<MortgageInput>;
  onSubmit: (data: MortgageInput, presetId?: string) => void;
  onReset?: () => void;
  selectedPresetId?: string;
  onPresetChange?: (presetId: string | undefined) => void;
}

export function MortgageForm({
  initialValues,
  onSubmit,
  onReset,
  selectedPresetId,
  onPresetChange
}: MortgageFormProps) {
  const [autoCommitEnabled, setAutoCommitEnabled] = useState(false);
  const [autoCommitTimeout, setAutoCommitTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const form = useForm<MortgageInput>({
    resolver: valibotResolver(mortgageSchema),
    defaultValues: {
      product: 'hipoteca_fija',
      propertyValue: 5_300_000,
      ltv: 0.9,
      termMonths: 240,
      interest: { bands: [{ fromMonth: 1, annualRate: 0.101 }] },
      growth: { annualIncreasePct: 0, increaseEndYear: 0 },
      costs: {
        openingCommissionPct: 0.01,
        adminDeferredMonthlyPct: 0.00008,
        appraisalCost: 14_500,
        notaryCost: 159_000,
        preoriginationCost: 780,
      },
      insurance: {
        lifeAnnualRateOnBalance: 0.0072,
        hazardAnnualRateOnInsuredValue: 0.0023,
        insuredValueFactor: 1,
        reindexInsuredValueAnnualPct: 0,
      },
      prepayments: [],
      prepaymentMode: 'reduce_term',
      roundingMode: 'round',
      ...initialValues
    }
  });

  const { watch, setValue, handleSubmit, formState: { errors, isValid } } = form;
  const watchedValues = watch();

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

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data, selectedPresetId);
  });

  const handleReset = () => {
    form.reset();
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
        <CardTitle>Simulador de Crédito Hipotecario</CardTitle>
        <CardDescription>
          Calcula el cronograma de amortización y proyecciones para tu hipoteca
        </CardDescription>
        
        {/* Helpful Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">¿Cómo usar el simulador?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Valor de la Propiedad:</strong> Precio de compra de la vivienda</li>
                <li>• <strong>LTV:</strong> Porcentaje del valor que financia el banco (ej. 0.90 = 90%)</li>
                <li>• <strong>Tasa Anual:</strong> Tasa de interés anual del crédito</li>
                <li>• <strong>Plazo:</strong> Tiempo en meses para pagar el crédito</li>
                <li>• Configura costos, seguros y pagos anticipados según tus necesidades</li>
              </ul>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="costs">Costos</TabsTrigger>
              <TabsTrigger value="insurance">Seguros</TabsTrigger>
              <TabsTrigger value="prepayments">Pagos Anticipados</TabsTrigger>
              <TabsTrigger value="advanced">Avanzado</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-primary">
                  <Home className="h-5 w-5" />
                  <h3>Información Básica del Crédito</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Tipo de Producto</Label>
                    <Select
                      value={form.watch('product')}
                      onValueChange={(value) => form.setValue('product', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hipoteca_fija">Hipoteca Fija</SelectItem>
                        <SelectItem value="hipoteca_creciente">Hipoteca Creciente</SelectItem>
                        <SelectItem value="muda">Muda</SelectItem>
                        <SelectItem value="remodela">Remodela</SelectItem>
                        <SelectItem value="tu_opcion_mexico">Tu Opción México</SelectItem>
                        <SelectItem value="terreno">Terreno</SelectItem>
                        <SelectItem value="liquidez">Liquidez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyValue">Valor de la Propiedad (MXN)</Label>
                    <Input
                      id="propertyValue"
                      type="number"
                      value={form.watch('propertyValue') || ''}
                      onChange={(e) => form.setValue('propertyValue', Number(e.target.value))}
                      placeholder="5,300,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ltv">LTV (Loan-to-Value)</Label>
                    <Input
                      id="ltv"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={form.watch('ltv') || ''}
                      onChange={(e) => form.setValue('ltv', Number(e.target.value))}
                      placeholder="0.90"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="termMonths">Plazo en Meses</Label>
                    <Input
                      id="termMonths"
                      type="number"
                      value={form.watch('termMonths') || ''}
                      onChange={(e) => form.setValue('termMonths', Number(e.target.value))}
                      placeholder="240"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualRate">Tasa Anual (%)</Label>
                    <Input
                      id="annualRate"
                      type="number"
                      step="0.01"
                      value={form.watch('interest.bands.0.annualRate') * 100 || ''}
                      onChange={(e) => {
                        const rate = Number(e.target.value) / 100;
                        form.setValue('interest.bands.0.annualRate', rate);
                      }}
                      placeholder="10.10"
                    />
                  </div>
                </div>

                {form.watch('product') === 'hipoteca_creciente' && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold">Configuración de Crecimiento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="annualIncreasePct">Incremento Anual (%)</Label>
                        <Input
                          id="annualIncreasePct"
                          type="number"
                          step="0.01"
                          value={form.watch('growth.annualIncreasePct') * 100 || ''}
                          onChange={(e) => {
                            const rate = Number(e.target.value) / 100;
                            form.setValue('growth.annualIncreasePct', rate);
                          }}
                          placeholder="2.20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="increaseEndYear">Año Final de Crecimiento</Label>
                        <Input
                          id="increaseEndYear"
                          type="number"
                          value={form.watch('growth.increaseEndYear') || ''}
                          onChange={(e) => form.setValue('growth.increaseEndYear', Number(e.target.value))}
                          placeholder="14"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="initialPagoPorMil">Pago por Mil Inicial</Label>
                        <Input
                          id="initialPagoPorMil"
                          type="number"
                          step="0.01"
                          value={form.watch('growth.initialPagoPorMil') || ''}
                          onChange={(e) => form.setValue('growth.initialPagoPorMil', Number(e.target.value))}
                          placeholder="9.72"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-primary">
                  <CreditCard className="h-5 w-5" />
                  <h3>Costos y Comisiones</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openingCommissionPct">Comisión de Apertura (%)</Label>
                    <Input
                      id="openingCommissionPct"
                      type="number"
                      step="0.001"
                      min="0"
                      value={form.watch('costs.openingCommissionPct') * 100}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || value === '0') {
                          form.setValue('costs.openingCommissionPct', 0);
                        } else {
                          const rate = Number(value) / 100;
                          form.setValue('costs.openingCommissionPct', rate);
                        }
                      }}
                      placeholder="1.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminDeferredMonthlyPct">Comisión Admin. Diferida Mensual (%)</Label>
                    <Input
                      id="adminDeferredMonthlyPct"
                      type="number"
                      step="0.00001"
                      value={form.watch('costs.adminDeferredMonthlyPct') * 100 || ''}
                      onChange={(e) => {
                        const rate = Number(e.target.value) / 100;
                        form.setValue('costs.adminDeferredMonthlyPct', rate);
                      }}
                      placeholder="0.008"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appraisalCost">Costo de Avalúo (MXN)</Label>
                    <Input
                      id="appraisalCost"
                      type="number"
                      value={form.watch('costs.appraisalCost') || ''}
                      onChange={(e) => form.setValue('costs.appraisalCost', Number(e.target.value))}
                      placeholder="14,500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notaryCost">Costo Notarial (MXN)</Label>
                    <Input
                      id="notaryCost"
                      type="number"
                      value={form.watch('costs.notaryCost') || ''}
                      onChange={(e) => form.setValue('costs.notaryCost', Number(e.target.value))}
                      placeholder="159,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preoriginationCost">Costo Pre-origination (MXN)</Label>
                    <Input
                      id="preoriginationCost"
                      type="number"
                      value={form.watch('costs.preoriginationCost') || ''}
                      onChange={(e) => form.setValue('costs.preoriginationCost', Number(e.target.value))}
                      placeholder="780"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-primary">
                  <Shield className="h-5 w-5" />
                  <h3>Configuración de Seguros</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lifeAnnualRateOnBalance">Tasa Anual Seguro de Vida (%)</Label>
                    <Input
                      id="lifeAnnualRateOnBalance"
                      type="number"
                      step="0.0001"
                      value={form.watch('insurance.lifeAnnualRateOnBalance') * 100 || ''}
                      onChange={(e) => {
                        const rate = Number(e.target.value) / 100;
                        form.setValue('insurance.lifeAnnualRateOnBalance', rate);
                      }}
                      placeholder="0.72"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hazardAnnualRateOnInsuredValue">Tasa Anual Seguro de Daños (%)</Label>
                    <Input
                      id="hazardAnnualRateOnInsuredValue"
                      type="number"
                      step="0.0001"
                      value={form.watch('insurance.hazardAnnualRateOnInsuredValue') * 100 || ''}
                      onChange={(e) => {
                        const rate = Number(e.target.value) / 100;
                        form.setValue('insurance.hazardAnnualRateOnInsuredValue', rate);
                      }}
                      placeholder="0.23"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuredValueFactor">Factor de Valor Asegurado</Label>
                    <Input
                      id="insuredValueFactor"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1.2"
                      value={form.watch('insurance.insuredValueFactor') || ''}
                      onChange={(e) => form.setValue('insurance.insuredValueFactor', Number(e.target.value))}
                      placeholder="1.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reindexInsuredValueAnnualPct">Reindexación Anual (%)</Label>
                    <Input
                      id="reindexInsuredValueAnnualPct"
                      type="number"
                      step="0.01"
                      value={form.watch('insurance.reindexInsuredValueAnnualPct') * 100 || ''}
                      onChange={(e) => {
                        const rate = Number(e.target.value) / 100;
                        form.setValue('insurance.reindexInsuredValueAnnualPct', rate);
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prepayments" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-primary">
                  <Calculator className="h-5 w-5" />
                  <h3>Pagos Anticipados</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepaymentMode">Modo de Aplicación</Label>
                  <Select
                    value={form.watch('prepaymentMode')}
                    onValueChange={(value) => form.setValue('prepaymentMode', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el modo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reduce_term">Reducir Plazo</SelectItem>
                      <SelectItem value="reduce_installment">Reducir Mensualidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Los pagos anticipados se pueden configurar manualmente en el código.</p>
                  <p>Por defecto, no hay pagos anticipados configurados.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-primary">
                  <Settings className="h-5 w-5" />
                  <h3>Configuración Avanzada</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roundingMode">Modo de Redondeo</Label>
                  <Select
                    value={form.watch('roundingMode')}
                    onValueChange={(value) => form.setValue('roundingMode', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el modo de redondeo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round">Redondear</SelectItem>
                      <SelectItem value="floor">Redondear hacia abajo</SelectItem>
                      <SelectItem value="ceil">Redondear hacia arriba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
              Calcular Hipoteca
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reiniciar
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
