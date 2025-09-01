import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAddCalculation, useCurrentCalculation, useCalculation } from '../hooks/useCalculations';
import { CalculatorForm } from '../components/calculator-form';
import { CalculationResults } from '../components/calculation-results';
import { CalculationHistory } from '../components/calculation-history';
import type { CalculationInput, CalculationResult } from '../lib/types';
import { toast } from 'sonner';

export function CalculatorPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  const [selectedCalculationId, setSelectedCalculationId] = useState<string | undefined>();
  
  const addCalculation = useAddCalculation();
  const { data: currentCalculation } = useCurrentCalculation();
  const { data: selectedCalculation } = useCalculation(selectedCalculationId || '');

  // Set current calculation as selected if none is selected
  useEffect(() => {
    if (!selectedCalculationId && currentCalculation) {
      setSelectedCalculationId(currentCalculation.id);
    }
  }, [selectedCalculationId, currentCalculation]);

  const handleFormSubmit = (input: CalculationInput, presetId?: string) => {
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

  const handleCalculationSelect = (calculation: CalculationResult) => {
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
        <h1 className="text-3xl font-bold">Calculadora de Tarjeta de Crédito</h1>
        <p className="text-muted-foreground">
          Calcula el interés y cronograma de pagos mínimos para tomar decisiones informadas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form and Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calculator Form */}
          <CalculatorForm
            initialValues={displayCalculation?.input}
            onSubmit={handleFormSubmit}
            selectedPresetId={selectedPresetId}
            onPresetChange={handlePresetChange}
          />

          {/* Calculation Results */}
          <CalculationResults
            result={displayCalculation || null}
            isLoading={addCalculation.isPending}
          />
        </div>

        {/* Right Column - History */}
        <div className="lg:col-span-1">
          <CalculationHistory
            selectedCalculationId={selectedCalculationId}
            onCalculationSelect={handleCalculationSelect}
            onJumpToCurrent={handleJumpToCurrent}
          />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/calculator')({
  component: CalculatorPage,
})
