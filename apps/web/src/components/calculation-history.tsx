import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { useCalculations, useDeleteCalculation, useClearAllCalculations } from '../hooks/useCalculations';
import { usePresets } from '../hooks/usePresets';
import type { CalculationResult } from '../lib/types';
import { formatCurrency, formatDate, formatRelativeTime, formatPercentage, getLocaleLabels } from '../lib/utils/formatting';
import { Trash2, Copy, Clock, TrendingUp, AlertTriangle, Search, ArrowUpRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface CalculationHistoryProps {
  selectedCalculationId?: string;
  onCalculationSelect: (calculation: CalculationResult) => void;
  onJumpToCurrent: () => void;
}

export function CalculationHistory({
  selectedCalculationId,
  onCalculationSelect,
  onJumpToCurrent
}: CalculationHistoryProps) {
  const { data: calculations = [], isLoading } = useCalculations();
  const { data: presets = [] } = usePresets();
  const deleteCalculation = useDeleteCalculation();
  const clearAllCalculations = useClearAllCalculations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  
  const labels = getLocaleLabels();
  
  // Filter calculations based on search query
  const filteredCalculations = calculations.filter(calc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      calc.name.toLowerCase().includes(query) ||
      calc.presetId?.toLowerCase().includes(query) ||
      calc.input.principal.toString().includes(query) ||
      calc.input.apr.toString().includes(query)
    );
  });

  const handleDeleteClick = (calculationId: string) => {
    setCalculationToDelete(calculationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (calculationToDelete) {
      deleteCalculation.mutate(calculationToDelete);
      setDeleteDialogOpen(false);
      setCalculationToDelete(null);
    }
  };

  const handleClearAllClick = () => {
    setClearAllDialogOpen(true);
  };

  const handleClearAllConfirm = () => {
    clearAllCalculations.mutate();
    setClearAllDialogOpen(false);
  };

  const getPresetName = (presetId?: string) => {
    if (!presetId) return 'Personalizado';
    const preset = presets.find(p => p.id === presetId);
    return preset ? preset.name : 'Desconocido';
  };

  const getCalculationIcon = (calculation: CalculationResult) => {
    const { schedule } = calculation;
    
    if (schedule.length >= 600) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    
    if (schedule.some((item, index) => index > 0 && item.endingBalance > item.startingBalance)) {
      return <TrendingUp className="h-4 w-4 text-orange-500" />;
    }
    
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>Cargando cálculos...</CardDescription>
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

  return (
    <>
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Historial de Cálculos</CardTitle>
          <CardDescription>
            {calculations.length} cálculo{calculations.length !== 1 ? 's' : ''} guardado{calculations.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cálculos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onJumpToCurrent}
              className="flex-1"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              {labels.jumpToCurrent}
            </Button>
            {calculations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllClick}
                className="text-destructive hover:text-destructive"
              >
                {labels.clearAll}
              </Button>
            )}
          </div>

          {/* Calculations List */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredCalculations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No se encontraron cálculos' : 'No hay cálculos guardados'}
                </div>
              ) : (
                filteredCalculations.map((calculation) => {
                  const isSelected = calculation.id === selectedCalculationId;
                  const isCurrent = calculations[0]?.id === calculation.id;
                  
                  return (
                    <div
                      key={calculation.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                      onClick={() => onCalculationSelect(calculation)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {getCalculationIcon(calculation)}
                            <h4 className="font-medium text-sm truncate">
                              {calculation.name}
                            </h4>
                            {isCurrent && (
                              <Badge variant="default" className="text-xs">
                                {labels.current}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                            <div>
                              <span className="font-medium">Saldo:</span>
                              <div>{formatCurrency(calculation.input.principal, calculation.input.currency, calculation.input.locale)}</div>
                            </div>
                            <div>
                              <span className="font-medium">APR:</span>
                              <div>{formatPercentage(calculation.input.apr, calculation.input.locale)}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                            <div>
                              <span className="font-medium">Meses:</span>
                              <div>{calculation.totals.months}</div>
                            </div>
                            <div>
                              <span className="font-medium">Preset:</span>
                              <div className="truncate">{getPresetName(calculation.presetId)}</div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {formatRelativeTime(calculation.createdAt, calculation.input.locale)}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement duplicate functionality
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(calculation.id);
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cálculo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cálculo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Limpiar todo el historial?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todos los cálculos guardados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllConfirm} className="bg-destructive text-destructive-foreground">
              Limpiar Todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
