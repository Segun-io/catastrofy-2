import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PresetsService } from '../services/presets';
import type { Preset, BankId } from '../lib/types';

// Query keys
export const presetKeys = {
  all: ['presets'] as const,
  byId: (id: string) => ['presets', id] as const,
  byBank: (bankId: BankId) => ['presets', 'bank', bankId] as const,
  builtIn: ['presets', 'builtIn'] as const,
  userDefined: ['presets', 'userDefined'] as const,
  search: (query: string) => ['presets', 'search', query] as const,
  byInterestMethod: (method: string) => ['presets', 'interestMethod', method] as const,
  byPaymentFormula: (formula: string) => ['presets', 'paymentFormula', formula] as const
};

// Queries
export function usePresets() {
  return useQuery({
    queryKey: presetKeys.all,
    queryFn: () => PresetsService.getAll(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function usePreset(id: string) {
  return useQuery({
    queryKey: presetKeys.byId(id),
    queryFn: () => PresetsService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function usePresetsByBank(bankId: BankId) {
  return useQuery({
    queryKey: presetKeys.byBank(bankId),
    queryFn: () => PresetsService.getByBank(bankId),
    enabled: !!bankId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useBuiltInPresets() {
  return useQuery({
    queryKey: presetKeys.builtIn,
    queryFn: () => PresetsService.getBuiltIn(),
    staleTime: Infinity, // Built-in presets never change
  });
}

export function useUserDefinedPresets() {
  return useQuery({
    queryKey: presetKeys.userDefined,
    queryFn: () => PresetsService.getUserDefined(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePresetsSearch(query: string) {
  return useQuery({
    queryKey: presetKeys.search(query),
    queryFn: () => PresetsService.search(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePresetsByInterestMethod(method: string) {
  return useQuery({
    queryKey: presetKeys.byInterestMethod(method),
    queryFn: () => PresetsService.getByInterestMethod(method),
    enabled: !!method,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function usePresetsByPaymentFormula(formula: string) {
  return useQuery({
    queryKey: presetKeys.byPaymentFormula(formula),
    queryFn: () => PresetsService.getByPaymentFormula(formula),
    enabled: !!formula,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Mutations
export function useAddPreset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preset: Omit<Preset, 'id'>) => PresetsService.add(preset),
    onSuccess: () => {
      // Invalidate all preset queries
      queryClient.invalidateQueries({ queryKey: presetKeys.all });
      queryClient.invalidateQueries({ queryKey: presetKeys.userDefined });
    }
  });
}

export function useUpdatePreset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<Preset>; 
    }) => PresetsService.update(id, updates),
    onSuccess: (updated, { id }) => {
      // Update specific preset in cache
      queryClient.setQueryData(presetKeys.byId(id), updated);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: presetKeys.all });
      queryClient.invalidateQueries({ queryKey: presetKeys.userDefined });
    }
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => PresetsService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: presetKeys.byId(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: presetKeys.all });
      queryClient.invalidateQueries({ queryKey: presetKeys.userDefined });
    }
  });
}

export function useResetToDefaultPresets() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => PresetsService.resetToDefaults(),
    onSuccess: () => {
      // Invalidate all preset queries
      queryClient.invalidateQueries({ queryKey: presetKeys.all });
      queryClient.invalidateQueries({ queryKey: presetKeys.userDefined });
    }
  });
}
