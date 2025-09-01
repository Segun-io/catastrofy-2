import { describe, it, expect } from 'vitest';
import { 
  getDailyRate, 
  computeCycleInterest, 
  computeMinimumPayment,
  roundToCents,
  createCalculation 
} from '../calculator';
import type { CalculationInput } from '../types';

describe('Calculator Functions', () => {
  it('should calculate daily rate correctly', () => {
    const apr = 0.60; // 60%
    const dailyRate = getDailyRate(apr);
    expect(dailyRate).toBeCloseTo(0.60 / 365, 6);
  });

  it('should compute cycle interest with averageDailyBalance method', () => {
    const balance = 10000;
    const apr = 0.60;
    const method = 'averageDailyBalance';
    const cycleDays = 30;
    
    const interest = computeCycleInterest(balance, apr, method, cycleDays);
    expect(interest).toBeCloseTo(10000 * (0.60 / 12), 2);
  });

  it('should compute minimum payment correctly', () => {
    const input: CalculationInput = {
      principal: 10000,
      apr: 0.60,
      cycleDays: 30,
      minPaymentPercent: 0.05,
      minPaymentFloor: 200,
      interestMethod: 'averageDailyBalance',
      minPaymentFormula: 'percentOnly',
      locale: 'es-MX',
      currency: 'MXN'
    };
    
    const statementBalance = 10000;
    const interest = 500;
    const fees = 0;
    
    const minPayment = computeMinimumPayment(input, statementBalance, interest, fees);
    expect(minPayment).toBe(500); // 5% of 10000
  });

  it('should round to cents correctly', () => {
    expect(roundToCents(123.456)).toBe(123.46);
    expect(roundToCents(123.444)).toBe(123.44);
    expect(roundToCents(123.5)).toBe(123.5);
  });

  it('should create calculation with correct structure', () => {
    const input: CalculationInput = {
      principal: 10000,
      apr: 0.60,
      cycleDays: 30,
      minPaymentPercent: 0.05,
      minPaymentFloor: 200,
      interestMethod: 'averageDailyBalance',
      minPaymentFormula: 'percentOnly',
      locale: 'es-MX',
      currency: 'MXN'
    };
    
    const calculation = createCalculation(input, 'Test Calculation');
    
    expect(calculation.input).toEqual(input);
    expect(calculation.name).toBe('Test Calculation');
    expect(calculation.schedule).toBeInstanceOf(Array);
    expect(calculation.totals).toHaveProperty('months');
    expect(calculation.totals).toHaveProperty('totalPaid');
    expect(calculation.totals).toHaveProperty('totalInterest');
    expect(calculation.createdAt).toBeDefined();
  });
});
