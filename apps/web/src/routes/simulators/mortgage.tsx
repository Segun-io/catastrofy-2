import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { mortgageSchema } from '../../lib/schemas/mortgageSchema';
import { type MortgageInput } from '../../lib/types/mortgage';
import { useMortgageQuery } from '../../hooks/useMortgageQuery';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Loader from '../../components/loader';

export const Route = createFileRoute('/simulators/mortgage')({
  component: MortgagePage,
});

function MortgagePage() {
  const form = useForm<MortgageInput>({
    resolver: valibotResolver(mortgageSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const input = form.formState.isValid
    ? (form.getValues() as MortgageInput)
    : null;

  const { data, isFetching, error } = useMortgageQuery(input);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Simulador de Crédito Hipotecario</h1>
        <p className="text-muted-foreground">
          Calcula el cronograma de amortización y proyecciones para tu hipoteca
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="costs">Costos</TabsTrigger>
          <TabsTrigger value="insurance">Seguros</TabsTrigger>
          <TabsTrigger value="prepayments">Pagos Anticipados</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica del Crédito</CardTitle>
              <CardDescription>
                Configura los parámetros principales del préstamo hipotecario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Costos y Comisiones</CardTitle>
              <CardDescription>
                Configura las comisiones y costos asociados al crédito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguros</CardTitle>
              <CardDescription>
                Configura las tasas y parámetros de los seguros de vida y daños
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prepayments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagos Anticipados</CardTitle>
              <CardDescription>
                Configura pagos anticipados y el modo de aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                Error al calcular la hipoteca: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {isFetching && <Loader />}

          {data && !isFetching && (
            <div className="space-y-6">
              <Summary totals={data.totals} />
              <ScheduleTable rows={data.rows} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getDefaultValues(): MortgageInput {
  return {
    product: 'hipoteca_fija',
    propertyValue: 5_300_000,
    ltv: 0.9,
    termMonths: 240,
    interest: { bands: [{ fromMonth: 1, annualRate: 0.101 }] },
    growth: { annualIncreasePct: 0, increaseEndYear: 0 },
    costs: {
      openingCommissionPct: 0.01,
      adminDeferredMonthlyPct: 0.00008, // 0.008% monthly
      appraisalCost: 14_500,
      notaryCost: 159_000,
      preoriginationCost: 780,
    },
    insurance: {
      lifeAnnualRateOnBalance: 0.0072, // ~0.72%/yr
      hazardAnnualRateOnInsuredValue: 0.0023, // ~0.23%/yr
      insuredValueFactor: 1,
      reindexInsuredValueAnnualPct: 0,
    },
    prepayments: [],
    prepaymentMode: 'reduce_term',
    roundingMode: 'round',
  };
}



function Summary({ totals }: { totals: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total de Intereses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.interestTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.principalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Base</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.baseTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pago por Mil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totals.pagoPorMil.toFixed(4)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Seguros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.insuranceTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Comisión Admin. Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.adminCommissionTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Desembolso Inicial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.initialDisbursementRequired.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScheduleTable({ rows }: { rows: any[] }) {
  const [displayRows, setDisplayRows] = React.useState(12);
  const [showAll, setShowAll] = React.useState(false);

  const visibleRows = showAll ? rows : rows.slice(0, displayRows);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cronograma de Amortización</CardTitle>
        <CardDescription>
          Tabla de pagos mensuales detallada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pago</TableHead>
                <TableHead>Saldo Insoluto</TableHead>
                <TableHead>Interés</TableHead>
                <TableHead>Amortización</TableHead>
                <TableHead>Mensualidad (s/accesorios)</TableHead>
                <TableHead>Seguros de vida y daños</TableHead>
                <TableHead>Com.Admin-Aut-Cred. Dif</TableHead>
                <TableHead>Mensualidad Total</TableHead>
                <TableHead>Pagos Anticipados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell>
                    ${row.openingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    ${row.interest.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    ${row.principal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    ${row.basePayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    ${row.insurance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    ${row.adminCommission.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    ${row.totalPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    ${row.prepayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {!showAll && rows.length > displayRows && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
            >
              Mostrar Todos los Pagos ({rows.length} meses)
            </Button>
          </div>
        )}

        {showAll && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(false)}
            >
              Mostrar Solo Primeros {displayRows} Pagos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
