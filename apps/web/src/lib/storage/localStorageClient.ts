import { parse, safeParse } from 'valibot';
import { 
  StoredCalculationsSchema, 
  StoredPresetsSchema
} from '../schemas';
import type { CalculationResult, Preset } from '../types';

const STORAGE_KEYS = {
  CALCULATIONS: 'cccalc:v1:calculations',
  PRESETS: 'cccalc:v1:presets'
} as const;

/**
 * Safe localStorage client with valibot validation
 */
export class LocalStorageClient {
  /**
   * Get calculations from localStorage with validation
   */
  static getCalculations(): CalculationResult[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CALCULATIONS);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      const result = safeParse(StoredCalculationsSchema, parsed);
      
      if (result.success) {
        return result.output;
      } else {
        console.warn('Invalid calculations data in localStorage, resetting to defaults');
        localStorage.removeItem(STORAGE_KEYS.CALCULATIONS);
        return [];
      }
    } catch (error) {
      console.error('Error reading calculations from localStorage:', error);
      localStorage.removeItem(STORAGE_KEYS.CALCULATIONS);
      return [];
    }
  }

  /**
   * Save calculations to localStorage with validation
   */
  static saveCalculations(calculations: CalculationResult[]): void {
    try {
      // Validate before saving
      parse(StoredCalculationsSchema, calculations);
      localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(calculations));
    } catch (error) {
      console.error('Error saving calculations to localStorage:', error);
      throw new Error('Failed to save calculations: validation error');
    }
  }

  /**
   * Get presets from localStorage with validation
   */
  static getPresets(): Preset[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRESETS);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      const result = safeParse(StoredPresetsSchema, parsed);
      
      if (result.success) {
        return result.output;
      } else {
        console.warn('Invalid presets data in localStorage, resetting to defaults');
        localStorage.removeItem(STORAGE_KEYS.PRESETS);
        return [];
      }
    } catch (error) {
      console.error('Error reading presets from localStorage:', error);
      localStorage.removeItem(STORAGE_KEYS.PRESETS);
      return [];
    }
  }

  /**
   * Save presets to localStorage with validation
   */
  static savePresets(presets: Preset[]): void {
    try {
      // Validate before saving
      parse(StoredPresetsSchema, presets);
      localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
    } catch (error) {
      console.error('Error saving presets to localStorage:', error);
      throw new Error('Failed to save presets: validation error');
    }
  }

  /**
   * Clear all stored data
   */
  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.CALCULATIONS);
    localStorage.removeItem(STORAGE_KEYS.PRESETS);
  }

  /**
   * Get storage size information
   */
  static getStorageInfo(): { calculations: number; presets: number } {
    const calculations = this.getCalculations();
    const presets = this.getPresets();
    
    return {
      calculations: calculations.length,
      presets: presets.length
    };
  }
}
