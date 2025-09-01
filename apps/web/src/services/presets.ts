import { LocalStorageClient } from '../lib/storage/localStorageClient';
import { DEFAULT_PRESETS } from '../lib/presets/catalog';
import type { Preset, BankId } from '../lib/types';

/**
 * Service for managing presets
 */
export class PresetsService {
  /**
   * Get all presets (built-in + user-defined)
   */
  static getAll(): Preset[] {
    const userPresets = LocalStorageClient.getPresets();
    return [...DEFAULT_PRESETS, ...userPresets];
  }

  /**
   * Get preset by ID
   */
  static getById(id: string): Preset | undefined {
    const presets = this.getAll();
    return presets.find(preset => preset.id === id);
  }

  /**
   * Get presets by bank ID
   */
  static getByBank(bankId: BankId): Preset[] {
    const presets = this.getAll();
    return presets.filter(preset => preset.bankId === bankId);
  }

  /**
   * Add a user-defined preset
   */
  static add(preset: Omit<Preset, 'id'>): Preset {
    const newPreset: Preset = {
      ...preset,
      id: crypto.randomUUID()
    };
    
    const userPresets = LocalStorageClient.getPresets();
    userPresets.push(newPreset);
    
    LocalStorageClient.savePresets(userPresets);
    return newPreset;
  }

  /**
   * Update a user-defined preset
   */
  static update(id: string, updates: Partial<Preset>): Preset | undefined {
    const userPresets = LocalStorageClient.getPresets();
    const index = userPresets.findIndex(preset => preset.id === id);
    
    if (index === -1) return undefined;
    
    const updated = { ...userPresets[index], ...updates };
    userPresets[index] = updated;
    
    LocalStorageClient.savePresets(userPresets);
    return updated;
  }

  /**
   * Delete a user-defined preset
   */
  static delete(id: string): boolean {
    const userPresets = LocalStorageClient.getPresets();
    const filtered = userPresets.filter(preset => preset.id !== id);
    
    if (filtered.length === userPresets.length) {
      return false; // Nothing was deleted
    }
    
    LocalStorageClient.savePresets(filtered);
    return true;
  }

  /**
   * Reset to default presets (clear user-defined ones)
   */
  static resetToDefaults(): void {
    LocalStorageClient.savePresets([]);
  }

  /**
   * Get only user-defined presets
   */
  static getUserDefined(): Preset[] {
    return LocalStorageClient.getPresets();
  }

  /**
   * Get only built-in presets
   */
  static getBuiltIn(): Preset[] {
    return DEFAULT_PRESETS;
  }

  /**
   * Check if a preset is built-in
   */
  static isBuiltIn(id: string): boolean {
    return DEFAULT_PRESETS.some(preset => preset.id === id);
  }

  /**
   * Search presets by name or bank
   */
  static search(query: string): Preset[] {
    const presets = this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return presets.filter(preset => 
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.bankId.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get presets by interest method
   */
  static getByInterestMethod(method: string): Preset[] {
    const presets = this.getAll();
    return presets.filter(preset => preset.defaults.interestMethod === method);
  }

  /**
   * Get presets by payment formula
   */
  static getByPaymentFormula(formula: string): Preset[] {
    const presets = this.getAll();
    return presets.filter(preset => preset.defaults.minPaymentFormula === formula);
  }
}
