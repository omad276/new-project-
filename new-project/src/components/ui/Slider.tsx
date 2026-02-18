import { useCallback, useRef, useState, useEffect } from 'react';

export interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
  showValue?: boolean;
  disabled?: boolean;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  formatValue,
  className = '',
  showValue = true,
  disabled = false,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate percentage for positioning
  const percentage = ((value - min) / (max - min)) * 100;

  // Format the display value
  const displayValue = formatValue ? formatValue(value) : value.toString();

  const handleChange = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return;

      const rect = trackRef.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      const clampedPosition = Math.max(0, Math.min(1, position));

      // Calculate value and snap to step
      let newValue = min + clampedPosition * (max - min);
      newValue = Math.round(newValue / step) * step;
      newValue = Math.max(min, Math.min(max, newValue));

      onChange(newValue);
    },
    [min, max, step, onChange, disabled]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      handleChange(e.clientX);
    },
    [handleChange, disabled]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      setIsDragging(true);
      handleChange(e.touches[0].clientX);
    },
    [handleChange, disabled]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleChange(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      handleChange(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleChange]);

  return (
    <div className={`${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-text-secondary">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-primary">{displayValue}</span>
          )}
        </div>
      )}

      <div
        ref={trackRef}
        className={`relative h-2 rounded-full cursor-pointer ${
          disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-background-tertiary'
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Filled track */}
        <div
          className={`absolute h-full rounded-full transition-all ${
            disabled ? 'bg-gray-400' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-md transition-transform ${
            disabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:scale-110 cursor-grab'
          } ${isDragging ? 'scale-110 cursor-grabbing' : ''}`}
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    </div>
  );
}

export default Slider;
