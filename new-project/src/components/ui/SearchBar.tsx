import { useState, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  defaultValue?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
}

function SearchBar({
  placeholder = 'Search...',
  onSearch,
  defaultValue = '',
  className,
  size = 'md',
  showClearButton = true,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  const sizes = {
    sm: 'py-2 ps-9 pe-3 text-sm',
    md: 'py-2.5 ps-10 pe-4 text-base',
    lg: 'py-3 ps-12 pe-5 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4 start-2.5',
    md: 'w-5 h-5 start-3',
    lg: 'w-6 h-6 start-3.5',
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-text-muted pointer-events-none',
          iconSizes[size]
        )}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg',
          'bg-background-secondary border border-background-tertiary',
          'text-text-primary placeholder:text-text-muted',
          'transition-colors duration-200',
          'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
          sizes[size]
        )}
      />
      {showClearButton && value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-background-tertiary text-text-muted hover:text-text-primary transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}

export { SearchBar };
