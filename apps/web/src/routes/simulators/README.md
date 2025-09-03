# Mortgage Simulator

A comprehensive Mexican mortgage (crédito hipotecario) simulator that matches the BBVA amortization table format.

## Features

- **Multiple Product Types**: Supports Hipoteca Fija, Hipoteca Creciente, and other BBVA products
- **Accurate Calculations**: Matches the exact format and calculations from BBVA's amortization tables
- **Real-time Updates**: Uses TanStack Query for efficient caching and real-time calculations
- **URL Persistence**: All form values are saved in the URL for easy sharing
- **Responsive UI**: Built with shadcn/ui components for a modern, accessible interface

## Usage

Navigate to `/simulators/mortgage` to access the mortgage simulator.

### Form Steps

1. **Basic Information**: Configure product type, property value, LTV, term, and interest rate
2. **Costs & Commissions**: Set opening commission, admin fees, and other costs
3. **Insurance Settings**: Configure life and hazard insurance rates
4. **Prepayments**: Set up optional prepayment rules
5. **Results**: View the complete amortization schedule and summary totals

### Default Values

The simulator comes pre-configured with values that match the BBVA Hipoteca Fija example:
- Property Value: $5,300,000 MXN
- LTV: 90%
- Principal: $4,770,000 MXN
- Term: 240 months (20 years)
- Annual Rate: 10.10%
- Admin Commission: 0.008% monthly
- Insurance: 0.72% life + 0.23% hazard annually

### Expected Results

With the default values, you should see:
- First month base payment: ~$46,348.01
- First month total payment: ~$50,606.82
- Pago por mil: ~9.7165
- Total interest: ~$6,353,523.78
- Grand total: ~$11,927,127.54

## Technical Implementation

- **Pure Functions**: All calculations are in `lib/mortgageMath.ts` with no side effects
- **Type Safety**: Full TypeScript coverage with strict validation using Valibot
- **Caching**: TanStack Query handles calculation caching and invalidation
- **Form Management**: React Hook Form with real-time validation
- **URL State**: TanStack Router manages URL persistence for all form values

## Architecture

```
src/
├── lib/
│   ├── types/mortgage.ts          # TypeScript type definitions
│   ├── schemas/mortgageSchema.ts  # Valibot validation schema
│   └── mortgageMath.ts            # Pure calculation functions
├── hooks/
│   └── useMortgageQuery.ts        # TanStack Query hook
└── routes/simulators/
    └── mortgage.tsx               # Main simulator page
```
