import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAddMortgageCalculation, useCurrentMortgageCalculation, useMortgageCalculation } from '../../hooks/useMortgageCalculations';
import { MortgageForm } from '../../components/mortgage-form';
import { MortgageResults } from '../../components/mortgage-results';
import { MortgageHistory } from '../../components/mortgage-history';
import type { MortgageInput, MortgageCalculationResult } from '../../lib/types/mortgage';
import { toast } from 'sonner';

export const Route = createFileRoute('/simulators/mortgage')({
  component: MortgagePage,
});

export function MortgagePage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  const [selectedCalculationId, setSelectedCalculationId] = useState<string | undefined>();
  
  const addCalculation = useAddMortgageCalculation();
  const { data: currentCalculation } = useCurrentMortgageCalculation();
  const { data: selectedCalculation } = useMortgageCalculation(selectedCalculationId || '');

  // Set current calculation as selected if none is selected
  useEffect(() => {
    if (!selectedCalculationId && currentCalculation) {
      setSelectedCalculationId(currentCalculation.id);
    }
  }, [selectedCalculationId, currentCalculation]);

  const handleFormSubmit = (input: MortgageInput, presetId?: string) => {
    addCalculation.mutate({
      input,
      presetId
    }, {
      onSuccess: (result) => {
        // Select the newly created calculation
        setSelectedCalculationId(result.id);
        toast.success('Cálculo guardado exitosamente');
      },
      onError: (error) => {
        toast.error('Error al guardar el cálculo');
        console.error('Error saving calculation:', error);
      }
    });
  };

  const handleCalculationSelect = (calculation: MortgageCalculationResult) => {
    setSelectedCalculationId(calculation.id);
  };

  const handleJumpToCurrent = () => {
    if (currentCalculation) {
      setSelectedCalculationId(currentCalculation.id);
    }
  };

  const handlePresetChange = (presetId: string | undefined) => {
    setSelectedPresetId(presetId);
  };

  // Get the calculation to display (selected or current)
  const displayCalculation = selectedCalculation || currentCalculation;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Simulador de Crédito Hipotecario</h1>
        <p className="text-muted-foreground">
          Calcula el cronograma de amortización y proyecciones para tu hipoteca
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form and Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mortgage Form */}
          <MortgageForm
            initialValues={displayCalculation?.input}
            onSubmit={handleFormSubmit}
            selectedPresetId={selectedPresetId}
            onPresetChange={handlePresetChange}
          />

          {/* Mortgage Results */}
          <MortgageResults
            result={displayCalculation || null}
            isLoading={addCalculation.isPending}
          />
        </div>

        {/* Right Column - History */}
        <div className="lg:col-span-1">
          <MortgageHistory
            selectedCalculationId={selectedCalculationId}
            onCalculationSelect={handleCalculationSelect}
            onJumpToCurrent={handleJumpToCurrent}
          />
        </div>
      </div>
    </div>
  );
}


