# Catastrofy 2 - Financial Calculators

A modern React + TypeScript financial calculator suite built with TanStack Query, TanStack Router, and shadcn/ui components. Currently includes credit card interest calculator and mortgage simulator.

## Features

### Credit Card Calculator
- **Step-based Calculator**: Choose bank presets, edit inputs, and review results
- **Bank Presets**: Built-in presets for Mexican banks (BBVA, Santander, Banorte, etc.)
- **Flexible Inputs**: Adjust APR, payment percentages, fees, interest methods, and more
- **Payment Schedule**: Detailed month-by-month breakdown with warnings for growing balances
- **History Management**: Save, load, and manage calculation history with localStorage
- **Spanish Localization**: Full Spanish language support with proper currency formatting
- **Responsive Design**: Two-column layout optimized for desktop and mobile

### Mortgage Simulator (Simulador Hipotecario)
- **Multiple Product Types**: Supports Hipoteca Fija, Hipoteca Creciente, and other BBVA products
- **Accurate Calculations**: Matches the exact format and calculations from BBVA's amortization tables
- **Real-time Updates**: Uses TanStack Query for efficient caching and real-time calculations
- **URL Persistence**: All form values are saved in the URL for easy sharing
- **Comprehensive Inputs**: Property value, LTV, interest rates, costs, insurance, and prepayments
- **Amortization Schedule**: Detailed month-by-month breakdown with all payment components
- **Prepayment Support**: Configure additional payments with term reduction or installment reduction
- **History Management**: Save and manage multiple mortgage calculations
- **Responsive UI**: Built with shadcn/ui components for a modern, accessible interface

## Tech Stack

- **Frontend**: React 19 + TypeScript (strict mode)
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: TanStack Router with file-based routing
- **Forms**: react-hook-form with valibot validation
- **Tables**: TanStack Table for payment schedules
- **Storage**: localStorage with valibot schema validation
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd catastrofy-2

# Install dependencies
pnpm install

# Start development server
pnpm run dev:web
```

The app will be available at `http://localhost:3001`

### Available Scripts

- `pnpm run dev` - Start all apps in development mode
- `pnpm run dev:web` - Start only the web app
- `pnpm run build` - Build for production
- `pnpm run check-types` - Run TypeScript type checking

### Accessing the Applications

- **Credit Card Calculator**: Navigate to `/` (root) or `/calculator`
- **Mortgage Simulator**: Navigate to `/simulators/mortgage`

## Usage

### Credit Card Calculator

#### 1. Choose a Bank Preset

Select from built-in presets for Mexican banks or create custom ones. Each preset includes:
- Annual Percentage Rate (APR)
- Minimum payment percentage
- Payment floor amount
- Interest calculation method
- Payment formula type

#### 2. Configure Calculation Parameters

- **Principal**: Starting credit card balance
- **APR**: Annual interest rate (0-200%)
- **Daily Rate**: Automatically calculated from APR (can be overridden)
- **Cycle Days**: Billing cycle length (28-31 typical)
- **Minimum Payment**: Percentage and floor amount
- **Fees**: Optional monthly fees
- **New Charges**: Optional monthly spending
- **Interest Method**: Choose calculation method
- **Payment Formula**: How minimum payment is calculated

#### 3. Review Results

View comprehensive results including:
- **Summary Cards**: Months to payoff, total paid, total interest
- **Warnings**: Alerts for growing balances, safety caps, interest-only payments
- **Payment Schedule**: Detailed monthly breakdown with sorting and pagination
- **Calculation Details**: All input parameters used

#### 4. Save and Manage

- **Auto-save**: Calculations are automatically saved to localStorage
- **History Panel**: Browse, search, and manage saved calculations
- **Export/Import**: All data is stored locally and can be managed

### Mortgage Simulator

Navigate to `/simulators/mortgage` to access the mortgage simulator.

#### 1. Basic Information

Configure the fundamental mortgage parameters:
- **Product Type**: Choose from Hipoteca Fija, Hipoteca Creciente, or other BBVA products
- **Property Value**: Total value of the property in MXN
- **LTV (Loan-to-Value)**: Percentage of property value to finance (typically 80-90%)
- **Principal**: Loan amount (auto-calculated from property value × LTV)
- **Term**: Loan duration in months (60-240 typical)
- **Interest Rate**: Annual interest rate with support for rate bands

#### 2. Costs & Commissions

Set up all associated costs:
- **Opening Commission**: One-time fee as percentage of principal
- **Admin Commission**: Monthly deferred commission on original principal
- **Appraisal Cost**: Property appraisal fee
- **Notary Cost**: Legal documentation costs
- **Pre-origination Cost**: Additional upfront costs

#### 3. Insurance Settings

Configure insurance requirements:
- **Life Insurance**: Annual rate on outstanding balance
- **Hazard Insurance**: Annual rate on insured property value
- **Insured Value Factor**: Portion of property to insure (typically 80-100%)
- **Reindexing**: Annual adjustment rate for insured value

#### 4. Prepayments (Optional)

Set up additional payments:
- **Prepayment Amount**: Additional payment amount
- **Prepayment Month**: When to apply the prepayment
- **Prepayment Mode**: 
  - **Reduce Term**: Keep same payment, reduce loan duration
  - **Reduce Installment**: Keep same term, reduce monthly payment

#### 5. Results & Amortization Schedule

View comprehensive results including:
- **Summary Totals**: Total interest, principal, insurance, and grand total
- **Pago por Mil**: Payment per thousand pesos borrowed
- **Initial Disbursement**: Total upfront costs required
- **Amortization Schedule**: Month-by-month breakdown showing:
  - Opening/closing balances
  - Interest and principal components
  - Insurance and commission costs
  - Total monthly payment
  - Prepayment amounts (if any)

#### 6. History Management

- **Save Calculations**: Automatically save mortgage scenarios
- **Load Previous**: Access and modify previous calculations
- **Compare Scenarios**: Switch between different mortgage configurations

## Architecture

### Core Modules

#### Credit Card Calculator
- **`/lib/types.ts`**: TypeScript interfaces and types
- **`/lib/schemas.ts`**: Valibot validation schemas
- **`/lib/calculator.ts`**: Pure calculation functions
- **`/lib/presets/`**: Bank preset definitions
- **`/services/`**: Data layer for calculations and presets
- **`/hooks/`**: TanStack Query hooks for data management
- **`/components/`**: React components for UI

#### Mortgage Simulator
- **`/lib/types/mortgage.ts`**: Mortgage-specific TypeScript types
- **`/lib/schemas/mortgageSchema.ts`**: Valibot validation for mortgage inputs
- **`/lib/mortgageMath.ts`**: Pure mortgage calculation functions
- **`/hooks/useMortgageCalculations.ts`**: TanStack Query hooks for mortgage data
- **`/components/mortgage-*`**: Mortgage-specific UI components
- **`/routes/simulators/mortgage.tsx`**: Main mortgage simulator page

### Key Components

#### Credit Card Calculator
- **`CalculatorForm`**: Main input form with validation
- **`CalculationResults`**: Results display with summary and schedule
- **`PaymentScheduleTable`**: TanStack Table for payment breakdown
- **`CalculationHistory`**: Side panel for managing saved calculations

#### Mortgage Simulator
- **`MortgageForm`**: Multi-step form for mortgage configuration
- **`MortgageResults`**: Comprehensive results display with amortization schedule
- **`PaymentScheduleTable`**: Detailed mortgage payment breakdown
- **`MortgageHistory`**: Side panel for managing saved mortgage calculations

### Data Flow

#### Credit Card Calculator
1. User selects preset and configures inputs
2. Form validates data using valibot schemas
3. Calculator functions compute payment schedule
4. Results are displayed and saved to localStorage
5. TanStack Query manages cache and updates

#### Mortgage Simulator
1. User configures mortgage parameters through multi-step form
2. Form validates data using mortgage-specific valibot schemas
3. Mortgage calculation functions compute amortization schedule
4. Results are displayed with comprehensive breakdown
5. Calculations are saved to localStorage with history management
6. TanStack Query handles caching and real-time updates

## Development Status

### Completed Features
- ✅ Credit Card Interest Calculator (fully functional)
- ✅ Mortgage Simulator Core (fully functional)
- ✅ Bank Presets for Mexican institutions
- ✅ History Management for both calculators
- ✅ Responsive UI with dark/light mode
- ✅ Spanish localization
- ✅ URL persistence for mortgage simulator

### Missing Features & Known Issues

#### Testing Infrastructure
- **Disabled Test Files**: Several test files are currently disabled:
  - `apps/web/src/lib/__tests__/calculator.test.ts.disabled` - Credit card calculator tests
  - `apps/web/src/routes/simulators/mortgage-test.tsx.disabled` - Mortgage simulator test page
- **Test Coverage**: No active test suite is currently running
- **Integration Tests**: Missing end-to-end tests for both calculators

#### Mortgage Simulator Enhancements
- **Preset Management**: No built-in mortgage presets (unlike credit card calculator)
- **Export Functionality**: No PDF or Excel export for amortization schedules
- **Comparison Tools**: No side-by-side comparison of different mortgage scenarios
- **Advanced Features**: 
  - Variable rate adjustments
  - Balloon payments
  - Interest-only periods
  - Bi-weekly payment options

#### Credit Card Calculator Enhancements
- **Additional Banks**: Limited preset coverage for Mexican banks
- **International Support**: No support for other countries' banking systems
- **Advanced Scenarios**: No support for promotional rates or balance transfers

#### General Improvements
- **Data Export/Import**: No bulk data management capabilities
- **User Accounts**: No cloud storage or user authentication
- **Mobile App**: No native mobile application
- **API Integration**: No real-time rate updates from financial institutions

### Future Roadmap
1. **Testing**: Re-enable and expand test coverage
2. **Mortgage Presets**: Add bank-specific mortgage product presets
3. **Export Features**: Implement PDF/Excel export functionality
4. **Comparison Tools**: Add scenario comparison capabilities
5. **Mobile Optimization**: Enhance mobile user experience
6. **API Integration**: Connect to real-time financial data sources

## Validation

All inputs are validated using valibot schemas with:
- **Type Safety**: Strict TypeScript with no `any` types
- **Bounds Checking**: APR (0-200%), payment percentages (0-50%), etc.
- **Data Coercion**: Automatic conversion from strings to numbers
- **Storage Validation**: localStorage payloads validated on read/write

## Localization

The app supports Spanish (es-MX) by default with:
- **Labels**: All UI text in Spanish
- **Currency**: Mexican Peso (MXN) formatting
- **Numbers**: Locale-specific number and percentage formatting
- **Dates**: Relative time display in Spanish

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [TanStack](https://tanstack.com/) libraries
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Validation powered by [Valibot](https://valibot.dev/)
- Icons from [Lucide React](https://lucide.dev/)
