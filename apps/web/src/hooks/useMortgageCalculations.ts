import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MortgageCalculationsService } from '../services/mortgageCalculations';
import type { MortgageCalculationResult, MortgageInput } from '../lib/types/mortgage';

// Query keys
export const mortgageCalculationKeys = {
  all: ['mortgage-calculations'] as const,
  byId: (id: string) => ['mortgage-calculations', id] as const,
  current: ['mortgage-calculations', 'current'] as const,
  byPreset: (presetId: string) => ['mortgage-calculations', 'preset', presetId] as const,
  search: (query: string) => ['mortgage-calculations', 'search', query] as const
};

// Queries
export function useMortgageCalculations() {
  return useQuery({
    queryKey: mortgageCalculationKeys.all,
    queryFn: () => MortgageCalculationsService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMortgageCalculation(id: string) {
  return useQuery({
    queryKey: mortgageCalculationKeys.byId(id),
    queryFn: () => MortgageCalculationsService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCurrentMortgageCalculation() {
  return useQuery({
    queryKey: mortgageCalculationKeys.current,
    queryFn: () => MortgageCalculationsService.getCurrent(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMortgageCalculationsByPreset(presetId: string) {
  return useQuery({
    queryKey: mortgageCalculationKeys.byPreset(presetId),
    queryFn: () => MortgageCalculationsService.getByPreset(presetId),
    enabled: !!presetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMortgageCalculationsSearch(query: string) {
  return useQuery({
    queryKey: mortgageCalculationKeys.search(query),
    queryFn: () => MortgageCalculationsService.search(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Mutations
export function useAddMortgageCalculation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ input, name, presetId }: { 
      input: MortgageInput; 
      name?: string; 
      presetId?: string; 
    }) => MortgageCalculationsService.add(input, name, presetId),
    onSuccess: () => {
      // Invalidate all mortgage calculation queries
      queryClient.invalidateQueries({ queryKey: mortgageCalculationKeys.all });
      queryClient.invalidateQueries({ queryKey: mortgageCalculationKeys.current });
    }
  });
}

export function useUpdateMortgageCalculation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<MortgageCalculationResult>; 
    }) => MortgageCalculationsService.update(id, updates),
    onSuccess: (updated, { id }) => {
      // Update specific mortgage calculation in cache
      queryClient.setQueryData(mortgageCalculationKeys.byId(id), updated);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: mortgageCalculationKeys.all });
      queryClient.invalidateQueries({ queryKey: mortgageCalculationKeys.current });
    }
  });
}

export function useDeleteMortgageCalculation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => MortgageCalculationsService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: mortgageCalculationKeys.byId(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: mortgageCalculationKeys.all });
      queryClient.invalidateQueries({ queryKey: mortgageCalculationKeys.current });
    }
  });
}

export function useDuplicateMortgageCalculation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => MortgageCalculationsService.duplicate(id),
    onSuccess: () => {
      // Invalidate all mortgage calculation queries
      queryClient.invalidateQueries({ queryKey: mortgageCalculationKeys.all });
      queryClient.invalidateQueries({ queryKey: mortgageCalculationKeys.current });
    }
  });
}

export function useClearAllMortgageCalculations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => MortgageCalculationsService.clearAll(),
    onSuccess: () => {
      // Clear all mortgage calculation queries from cache
      queryClient.removeQueries({ queryKey: mortgageCalculationKeys.all });
      queryClient.removeQueries({ queryKey: mortgageCalculationKeys.current });
      queryClient.setQueryData(mortgageCalculationKeys.all, []);
    }
  });
}
