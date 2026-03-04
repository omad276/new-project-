'use client';

import { CostBreakdown } from '@/types';
import { formatCurrency } from '@/lib/cost-calculator';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CostTableProps {
  breakdown: CostBreakdown;
}

export function CostTable({ breakdown }: CostTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-700">
          <TableHead className="text-slate-400">Cost Type</TableHead>
          <TableHead className="text-right text-slate-400">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="border-slate-700">
          <TableCell className="text-slate-300">Sea Transport</TableCell>
          <TableCell className="text-right text-slate-300">
            {formatCurrency(breakdown.seaCost)}
          </TableCell>
        </TableRow>
        {breakdown.landCost > 0 && (
          <TableRow className="border-slate-700">
            <TableCell className="text-slate-300">Land/Pipeline</TableCell>
            <TableCell className="text-right text-slate-300">
              {formatCurrency(breakdown.landCost)}
            </TableCell>
          </TableRow>
        )}
        <TableRow className="border-slate-700">
          <TableCell className="text-slate-300">Insurance</TableCell>
          <TableCell className="text-right text-slate-300">
            {formatCurrency(breakdown.insurance)}
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter className="bg-slate-800/50">
        <TableRow>
          <TableCell className="font-semibold text-white">Total</TableCell>
          <TableCell className="text-right font-semibold text-orange-500">
            {formatCurrency(breakdown.total)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
