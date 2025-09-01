import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalculationsService } from '../services/calculations';
import type { CalculationInput, CalculationResult } from '../lib/types';

// Query keys
export const calculationKeys = {
  all: ['calculations'] as const,
  byId: (id: string) => ['calculations', id] as const,
  current: ['calculations', 'current'] as const,
  byPreset: (presetId: string) => ['calculations', 'preset', presetId] as const,
  search: (query: string) => ['calculations', 'search', query] as const
};

// Queries
export function useCalculations() {
  return useQuery({
    queryKey: calculationKeys.all,
    queryFn: () => CalculationsService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCalculation(id: string) {
  return useQuery({
    queryKey: calculationKeys.byId(id),
    queryFn: () => CalculationsService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCurrentCalculation() {
  return useQuery({
    queryKey: calculationKeys.current,
    queryFn: () => CalculationsService.getCurrent(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCalculationsByPreset(presetId: string) {
  return useQuery({
    queryKey: calculationKeys.byPreset(presetId),
    queryFn: () => CalculationsService.getByPreset(presetId),
    enabled: !!presetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCalculationsSearch(query: string) {
  return useQuery({
    queryKey: calculationKeys.search(query),
    queryFn: () => CalculationsService.search(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Mutations
export function useAddCalculation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ input, name, presetId }: { 
      input: CalculationInput; 
      name?: string; 
      presetId?: string; 
    }) => CalculationsService.add(input, name, presetId),
    onSuccess: () => {
      // Invalidate all calculation queries
      queryClient.invalidateQueries({ queryKey: calculationKeys.all });
      queryClient.invalidateQueries({ queryKey: calculationKeys.current });
    }
  });
}

export function useUpdateCalculation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<CalculationResult>; 
    }) => CalculationsService.update(id, updates),
    onSuccess: (updated, { id }) => {
      // Update specific calculation in cache
      queryClient.setQueryData(calculationKeys.byId(id), updated);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: calculationKeys.all });
      queryClient.invalidateQueries({ queryKey: calculationKeys.current });
    }
  });
}

export function useDeleteCalculation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => CalculationsService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: calculationKeys.byId(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: calculationKeys.all });
      queryClient.invalidateQueries({ queryKey: calculationKeys.current });
    }
  });
}

export function useDuplicateCalculation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => CalculationsService.duplicate(id),
    onSuccess: () => {
      // Invalidate all calculation queries
      queryClient.invalidateQueries({ queryKey: calculationKeys.all });
      queryClient.invalidateQueries({ queryKey: calculationKeys.current });
    }
  });
}

export function useClearAllCalculations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => CalculationsService.clearAll(),
    onSuccess: () => {
      // Clear all calculation queries from cache
      queryClient.removeQueries({ queryKey: calculationKeys.all });
      queryClient.removeQueries({ queryKey: calculationKeys.current });
      queryClient.setQueryData(calculationKeys.all, []);
    }
  });
}
