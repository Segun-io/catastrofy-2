import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import type { PaymentScheduleItem, CalculationResult } from '../lib/types';
import { formatCurrency, getLocaleLabels } from '../lib/utils/formatting';

interface PaymentScheduleTableProps {
  schedule: PaymentScheduleItem[];
  totals?: CalculationResult['totals'];
  currency?: string;
  locale?: string;
}

export function PaymentScheduleTable({ 
  schedule, 
  totals,
  currency = 'MXN', 
  locale = 'es-MX' 
}: PaymentScheduleTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  
  const labels = getLocaleLabels(locale);

  const columns: ColumnDef<PaymentScheduleItem>[] = [
    {
      accessorKey: 'monthIndex',
      header: 'Mes',
      cell: ({ row }) => (
        <div className="font-medium">
          {(row.getValue('monthIndex') as number) + 1}
        </div>
      ),
      sortingFn: 'basic',
    },
    {
      accessorKey: 'startingBalance',
      header: labels.startingBalance || 'Starting Balance',
      cell: ({ row }) => (
        <div className="font-mono">
          {formatCurrency(row.getValue('startingBalance'), currency, locale)}
        </div>
      ),
      sortingFn: 'basic',
    },
    {
      accessorKey: 'interestAccrued',
      header: labels.interestAccrued || 'Interest',
      cell: ({ row }) => (
        <div className="font-mono text-orange-600">
          {formatCurrency(row.getValue('interestAccrued'), currency, locale)}
        </div>
      ),
      sortingFn: 'basic',
    },
    {
      accessorKey: 'fees',
      header: labels.fees || 'Fees',
      cell: ({ row }) => (
        <div className="font-mono text-red-600">
          {formatCurrency(row.getValue('fees'), currency, locale)}
        </div>
      ),
      sortingFn: 'basic',
    },
    {
      accessorKey: 'payment',
      header: labels.payment || 'Payment',
      cell: ({ row }) => (
        <div className="font-mono text-green-600 font-semibold">
          {formatCurrency(row.getValue('payment'), currency, locale)}
        </div>
      ),
      sortingFn: 'basic',
    },
    {
      accessorKey: 'principalPaid',
      header: labels.principalPaid || 'Principal Paid',
      cell: ({ row }) => {
        const principalPaid = row.getValue('principalPaid') as number;
        const isNegative = principalPaid < 0;
        return (
          <div className={`font-mono ${isNegative ? 'text-red-600' : 'text-blue-600'}`}>
            {formatCurrency(principalPaid, currency, locale)}
          </div>
        );
      },
      sortingFn: 'basic',
    },
    {
      accessorKey: 'endingBalance',
      header: labels.endingBalance || 'Ending Balance',
      cell: ({ row }) => (
        <div className="font-mono font-semibold">
          {formatCurrency(row.getValue('endingBalance'), currency, locale)}
        </div>
      ),
      sortingFn: 'basic',
    },
    {
      accessorKey: 'onlyInterestCovered',
      header: labels.onlyInterestCovered || 'Only Interest',
      cell: ({ row }) => {
        const onlyInterest = row.getValue('onlyInterestCovered') as boolean;
        return (
          <div className="flex justify-center">
            {onlyInterest ? (
              <Badge variant="destructive" className="text-xs">
                ⚠️ Solo interés
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                ✓ Capital
              </Badge>
            )}
          </div>
        );
      },
      sortingFn: 'basic',
    },
  ];

  const table = useReactTable({
    data: schedule,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 12, // Show 12 months per page
      },
    },
  });

  const getSortIcon = (column: any) => {
    if (!column.getCanSort()) return null;
    
    if (column.getIsSorted() === 'asc') {
      return <ChevronUp className="h-4 w-4" />;
    }
    if (column.getIsSorted() === 'desc') {
      return <ChevronDown className="h-4 w-4" />;
    }
    return <ChevronsUpDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar en la tabla..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs">
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-1 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {getSortIcon(header.column)}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIndex) => {
                const isLastRow = rowIndex === table.getRowModel().rows.length - 1;
                const isLastPage = table.getState().pagination.pageIndex === table.getPageCount() - 1;
                const isLastPayment = isLastRow && isLastPage;
                
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`
                      ${row.getValue('onlyInterestCovered') ? 'bg-yellow-50' : ''}
                      ${isLastPayment ? 'bg-blue-100 border-l-4 border-blue-600 hover:bg-blue-100' : ''}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={`text-xs ${isLastPayment ? 'font-semibold text-gray-900' : ''}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay datos para mostrar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {totals && table.getState().pagination.pageIndex === table.getPageCount() - 1 && (
            <TableFooter>
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell className="text-center font-bold">TOTALES</TableCell>
                <TableCell className="font-mono text-muted-foreground">-</TableCell>
                <TableCell className="font-mono text-orange-600">
                  {formatCurrency(totals.totalInterest, currency, locale)}
                </TableCell>
                <TableCell className="font-mono text-red-600">
                  {formatCurrency(totals.totalFees, currency, locale)}
                </TableCell>
                <TableCell className="font-mono text-green-600">
                  {formatCurrency(totals.totalPaid, currency, locale)}
                </TableCell>
                <TableCell className="font-mono text-blue-600">
                  {formatCurrency(totals.totalPrincipalPaid, currency, locale)}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">-</TableCell>
                <TableCell className="text-center font-mono">
                  {totals.months} meses
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Pagination Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Página {table.getState().pagination.pageIndex + 1} de{' '}
          {table.getPageCount()}
        </div>
        <div>
          Mostrando {table.getRowModel().rows.length} de {schedule.length} filas
        </div>
      </div>
    </div>
  );
}
