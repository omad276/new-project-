import { type ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

function DataTable<T>({
  data,
  columns,
  keyExtractor,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  isLoading,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  const alignments = {
    start: 'text-start',
    center: 'text-center',
    end: 'text-end',
  };

  return (
    <div className={cn('overflow-x-auto rounded-xl bg-background-secondary', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-background-tertiary">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-4 py-3 font-semibold text-text-secondary text-sm',
                  alignments[column.align || 'start'],
                  column.sortable && 'cursor-pointer hover:text-text-primary select-none'
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && onSort?.(String(column.key))}
              >
                <div
                  className={cn(
                    'flex items-center gap-1',
                    column.align === 'center' && 'justify-center',
                    column.align === 'end' && 'justify-end'
                  )}
                >
                  {column.header}
                  {column.sortable && sortColumn === String(column.key) && (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            // Loading skeleton rows
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b border-background-tertiary">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-4">
                    <div className="h-4 bg-background-tertiary rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            // Empty state
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            // Data rows
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  'border-b border-background-tertiary last:border-b-0',
                  'transition-colors hover:bg-background-tertiary/50',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-4 text-text-primary',
                      alignments[column.align || 'start']
                    )}
                  >
                    {column.render
                      ? column.render(item)
                      : String((item as Record<string, unknown>)[column.key as string] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable };
