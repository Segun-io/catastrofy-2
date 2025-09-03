import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { useMortgageCalculations, useDeleteMortgageCalculation, useClearAllMortgageCalculations } from '../hooks/useMortgageCalculations';
import type { MortgageCalculationResult } from '../lib/types/mortgage';
import { Trash2, Copy, Clock, TrendingUp, AlertTriangle, Search, ArrowUpRight, Home } from 'lucide-react';
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

interface MortgageHistoryProps {
  selectedCalculationId?: string;
  onCalculationSelect: (calculation: MortgageCalculationResult) => void;
  onJumpToCurrent: () => void;
}

export function MortgageHistory({
  selectedCalculationId,
  onCalculationSelect,
  onJumpToCurrent
}: MortgageHistoryProps) {
  const { data: calculations = [], isLoading } = useMortgageCalculations();
  const deleteCalculation = useDeleteMortgageCalculation();
  const clearAllCalculations = useClearAllMortgageCalculations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  
  // Filter calculations based on search query
  const filteredCalculations = calculations.filter(calc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      calc.name.toLowerCase().includes(query) ||
      calc.presetId?.toLowerCase().includes(query) ||
      calc.input.propertyValue.toString().includes(query) ||
      calc.input.interest.bands[0]?.annualRate.toString().includes(query)
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

  const getCalculationIcon = (calculation: MortgageCalculationResult) => {
    const { rows } = calculation;
    
    // Check for potential issues
    if (rows.length >= 600) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    
    if (rows.some((row, index) => index > 0 && row.closingBalance > row.openingBalance)) {
      return <TrendingUp className="h-4 w-4 text-orange-500" />;
    }
    
    return <Home className="h-4 w-4 text-blue-500" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString('es-MX');
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
              Ir al Actual
            </Button>
            {calculations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllClick}
                className="text-destructive hover:text-destructive"
              >
                Limpiar Todo
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
                                Actual
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                            <div>
                              <span className="font-medium">Valor:</span>
                              <div>{formatCurrency(calculation.input.propertyValue)}</div>
                            </div>
                            <div>
                              <span className="font-medium">Tasa:</span>
                              <div>{formatPercentage(calculation.input.interest.bands[0]?.annualRate || 0)}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                            <div>
                              <span className="font-medium">Plazo:</span>
                              <div>{calculation.input.termMonths} meses</div>
                            </div>
                            <div>
                              <span className="font-medium">LTV:</span>
                              <div>{(calculation.input.ltv * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {formatRelativeTime(calculation.createdAt)}
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
