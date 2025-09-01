# Catastrofy 2 - Credit Card Calculator

A modern React + TypeScript credit card minimum-payment and interest calculator built with TanStack Query, TanStack Router, and shadcn/ui components.

## Features

- **Step-based Calculator**: Choose bank presets, edit inputs, and review results
- **Bank Presets**: Built-in presets for Mexican banks (BBVA, Santander, Banorte, etc.)
- **Flexible Inputs**: Adjust APR, payment percentages, fees, interest methods, and more
- **Payment Schedule**: Detailed month-by-month breakdown with warnings for growing balances
- **History Management**: Save, load, and manage calculation history with localStorage
- **Spanish Localization**: Full Spanish language support with proper currency formatting
- **Responsive Design**: Two-column layout optimized for desktop and mobile

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

## Usage

### 1. Choose a Bank Preset

Select from built-in presets for Mexican banks or create custom ones. Each preset includes:
- Annual Percentage Rate (APR)
- Minimum payment percentage
- Payment floor amount
- Interest calculation method
- Payment formula type

### 2. Configure Calculation Parameters

- **Principal**: Starting credit card balance
- **APR**: Annual interest rate (0-200%)
- **Daily Rate**: Automatically calculated from APR (can be overridden)
- **Cycle Days**: Billing cycle length (28-31 typical)
- **Minimum Payment**: Percentage and floor amount
- **Fees**: Optional monthly fees
- **New Charges**: Optional monthly spending
- **Interest Method**: Choose calculation method
- **Payment Formula**: How minimum payment is calculated

### 3. Review Results

View comprehensive results including:
- **Summary Cards**: Months to payoff, total paid, total interest
- **Warnings**: Alerts for growing balances, safety caps, interest-only payments
- **Payment Schedule**: Detailed monthly breakdown with sorting and pagination
- **Calculation Details**: All input parameters used

### 4. Save and Manage

- **Auto-save**: Calculations are automatically saved to localStorage
- **History Panel**: Browse, search, and manage saved calculations
- **Export/Import**: All data is stored locally and can be managed

## Architecture

### Core Modules

- **`/lib/types.ts`**: TypeScript interfaces and types
- **`/lib/schemas.ts`**: Valibot validation schemas
- **`/lib/calculator.ts`**: Pure calculation functions
- **`/lib/presets/`**: Bank preset definitions
- **`/services/`**: Data layer for calculations and presets
- **`/hooks/`**: TanStack Query hooks for data management
- **`/components/`**: React components for UI

### Key Components

- **`CalculatorForm`**: Main input form with validation
- **`CalculationResults`**: Results display with summary and schedule
- **`PaymentScheduleTable`**: TanStack Table for payment breakdown
- **`CalculationHistory`**: Side panel for managing saved calculations

### Data Flow

1. User selects preset and configures inputs
2. Form validates data using valibot schemas
3. Calculator functions compute payment schedule
4. Results are displayed and saved to localStorage
5. TanStack Query manages cache and updates

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
