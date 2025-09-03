import { LocalStorageClient } from '../lib/storage/localStorageClient';
import type { MortgageCalculationResult, MortgageInput } from '../lib/types/mortgage';
import { computeMortgage } from '../lib/mortgageMath';

/**
 * Service for managing mortgage calculation results
 */
export class MortgageCalculationsService {
  /**
   * Get all mortgage calculations (most recent first)
   */
  static getAll(): MortgageCalculationResult[] {
    const calculations = LocalStorageClient.getMortgageCalculations();
    return calculations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get mortgage calculation by ID
   */
  static getById(id: string): MortgageCalculationResult | undefined {
    const calculations = this.getAll();
    return calculations.find(calc => calc.id === id);
  }

  /**
   * Add a new mortgage calculation
   */
  static add(input: MortgageInput, name?: string, presetId?: string): MortgageCalculationResult {
    const calculationName = name || this.generateCalculationName(input);
    const result = computeMortgage(input);
    
    const calculation: MortgageCalculationResult = {
      id: crypto.randomUUID(),
      name: calculationName,
      presetId,
      input: result.input,
      rows: result.rows,
      totals: result.totals,
      createdAt: new Date().toISOString()
    };
    
    const calculations = this.getAll();
    calculations.unshift(calculation); // Add to beginning (most recent)
    
    LocalStorageClient.saveMortgageCalculations(calculations);
    return calculation;
  }

  /**
   * Update an existing mortgage calculation
   */
  static update(id: string, updates: Partial<MortgageCalculationResult>): MortgageCalculationResult | undefined {
    const calculations = this.getAll();
    const index = calculations.findIndex(calc => calc.id === id);
    
    if (index === -1) return undefined;
    
    const updated = { ...calculations[index], ...updates };
    calculations[index] = updated;
    
    LocalStorageClient.saveMortgageCalculations(calculations);
    return updated;
  }

  /**
   * Delete a mortgage calculation
   */
  static delete(id: string): boolean {
    const calculations = this.getAll();
    const filtered = calculations.filter(calc => calc.id !== id);
    
    if (filtered.length === calculations.length) {
      return false; // Nothing was deleted
    }
    
    LocalStorageClient.saveMortgageCalculations(filtered);
    return true;
  }

  /**
   * Clear all mortgage calculations
   */
  static clearAll(): void {
    LocalStorageClient.saveMortgageCalculations([]);
  }

  /**
   * Get the most recent mortgage calculation (current)
   */
  static getCurrent(): MortgageCalculationResult | undefined {
    const calculations = this.getAll();
    return calculations[0];
  }

  /**
   * Duplicate a mortgage calculation
   */
  static duplicate(id: string): MortgageCalculationResult | undefined {
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
    
    LocalStorageClient.saveMortgageCalculations(calculations);
    return duplicated;
  }

  /**
   * Search mortgage calculations by name or preset
   */
  static search(query: string): MortgageCalculationResult[] {
    const calculations = this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return calculations.filter(calc => 
      calc.name.toLowerCase().includes(lowerQuery) ||
      calc.presetId?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get mortgage calculations by preset ID
   */
  static getByPreset(presetId: string): MortgageCalculationResult[] {
    const calculations = this.getAll();
    return calculations.filter(calc => calc.presetId === presetId);
  }

  /**
   * Generate a calculation name based on input
   */
  private static generateCalculationName(input: MortgageInput): string {
    const productNames: Record<string, string> = {
      hipoteca_fija: 'Hipoteca Fija',
      hipoteca_creciente: 'Hipoteca Creciente',
      muda: 'Muda',
      remodela: 'Remodela',
      tu_opcion_mexico: 'Tu Opción México',
      terreno: 'Terreno',
      liquidez: 'Liquidez'
    };

    const productName = productNames[input.product] || input.product;
    const principal = input.principal || (input.propertyValue * input.ltv);
    const formattedPrincipal = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(principal);

    return `${productName} - ${formattedPrincipal}`;
  }
}
