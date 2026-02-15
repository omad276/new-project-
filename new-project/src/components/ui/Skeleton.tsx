import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-background-tertiary',
        variants[variant],
        variant === 'text' && 'h-4',
        className
      )}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  );
}

// Property Card Skeleton
function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-background-secondary">
      {/* Image */}
      <Skeleton variant="rectangular" className="w-full h-48" />

      {/* Content */}
      <div className="p-4">
        {/* Badge */}
        <Skeleton width={60} height={24} className="rounded-full mb-3" />

        {/* Title */}
        <Skeleton className="h-5 w-3/4 mb-2" />

        {/* Location */}
        <Skeleton className="h-4 w-1/2 mb-4" />

        {/* Features */}
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Price */}
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}

// Table Row Skeleton
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-background-tertiary">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4" />
        </td>
      ))}
    </tr>
  );
}

// List Item Skeleton
function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export { Skeleton, PropertyCardSkeleton, TableRowSkeleton, ListItemSkeleton };
