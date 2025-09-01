import { LocalStorageClient } from '../lib/storage/localStorageClient';
import type { CalculationResult, CalculationInput } from '../lib/types';
import { createCalculation, generateCalculationName } from '../lib/calculator';

/**
 * Service for managing calculation results
 */
export class CalculationsService {
  /**
   * Get all calculations (most recent first)
   */
  static getAll(): CalculationResult[] {
    const calculations = LocalStorageClient.getCalculations();
    return calculations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get calculation by ID
   */
  static getById(id: string): CalculationResult | undefined {
    const calculations = this.getAll();
    return calculations.find(calc => calc.id === id);
  }

  /**
   * Add a new calculation
   */
  static add(input: CalculationInput, name?: string, presetId?: string): CalculationResult {
    const calculationName = name || generateCalculationName(input);
    const calculation = createCalculation(input, calculationName, presetId);
    
    const calculations = this.getAll();
    calculations.unshift(calculation); // Add to beginning (most recent)
    
    LocalStorageClient.saveCalculations(calculations);
    return calculation;
  }

  /**
   * Update an existing calculation
   */
  static update(id: string, updates: Partial<CalculationResult>): CalculationResult | undefined {
    const calculations = this.getAll();
    const index = calculations.findIndex(calc => calc.id === id);
    
    if (index === -1) return undefined;
    
    const updated = { ...calculations[index], ...updates };
    calculations[index] = updated;
    
    LocalStorageClient.saveCalculations(calculations);
    return updated;
  }

  /**
   * Delete a calculation
   */
  static delete(id: string): boolean {
    const calculations = this.getAll();
    const filtered = calculations.filter(calc => calc.id !== id);
    
    if (filtered.length === calculations.length) {
      return false; // Nothing was deleted
    }
    
    LocalStorageClient.saveCalculations(filtered);
    return true;
  }

  /**
   * Clear all calculations
   */
  static clearAll(): void {
    LocalStorageClient.saveCalculations([]);
  }

  /**
   * Get the most recent calculation (current)
   */
  static getCurrent(): CalculationResult | undefined {
    const calculations = this.getAll();
    return calculations[0];
  }

  /**
   * Duplicate a calculation
   */
  static duplicate(id: string): CalculationResult | undefined {
    const original = this.getById(id);
    if (!original) return undefined;
    
    const duplicated = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    
    const calculations = this.getAll();
    calculations.unshift(duplicated);
    
    LocalStorageClient.saveCalculations(calculations);
    return duplicated;
  }

  /**
   * Search calculations by name or preset
   */
  static search(query: string): CalculationResult[] {
    const calculations = this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return calculations.filter(calc => 
      calc.name.toLowerCase().includes(lowerQuery) ||
      calc.presetId?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get calculations by preset ID
   */
  static getByPreset(presetId: string): CalculationResult[] {
    const calculations = this.getAll();
    return calculations.filter(calc => calc.presetId === presetId);
  }
}
