import { useCallback, useRef, useEffect } from 'react';

// ============================================
// Throttle Utility
// ============================================

/**
 * Creates a throttled version of a function that only executes
 * at most once per specified time period.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  };
}

/**
 * Creates a debounced version of a function that only executes
 * after the specified delay has passed since the last call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// ============================================
// React Hooks for Canvas Performance
// ============================================

/**
 * Hook that returns a throttled callback.
 * The callback will only be executed at most once per delay period.
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const throttledRef = useRef<((...args: Parameters<T>) => void) | null>(null);

  if (!throttledRef.current) {
    throttledRef.current = throttle(
      (...args: Parameters<T>) => callbackRef.current(...args),
      delay
    );
  }

  return throttledRef.current;
}

/**
 * Hook that returns a debounced callback.
 * The callback will only be executed after the delay has passed since the last call.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const debouncedRef = useRef<((...args: Parameters<T>) => void) | null>(null);

  if (!debouncedRef.current) {
    debouncedRef.current = debounce(
      (...args: Parameters<T>) => callbackRef.current(...args),
      delay
    );
  }

  return debouncedRef.current;
}

/**
 * Hook for optimized canvas drawing using requestAnimationFrame.
 * Ensures smooth rendering by batching draw calls.
 */
export function useAnimationFrame(callback: () => void): () => void {
  const frameRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const requestDraw = useCallback(() => {
    if (frameRef.current !== null) {
      return; // Already scheduled
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      callbackRef.current();
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return requestDraw;
}

/**
 * Hook for optimized canvas drawing with throttled updates.
 * Combines requestAnimationFrame with throttling for smooth performance.
 */
export function useThrottledDraw(
  drawFn: () => void,
  throttleMs: number = 16 // ~60fps
): () => void {
  const frameRef = useRef<number | null>(null);
  const lastDrawRef = useRef<number>(0);
  const drawFnRef = useRef(drawFn);

  useEffect(() => {
    drawFnRef.current = drawFn;
  }, [drawFn]);

  const requestDraw = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastDrawRef.current;

    if (elapsed < throttleMs) {
      // Schedule for later if throttled
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = null;
          lastDrawRef.current = Date.now();
          drawFnRef.current();
        });
      }
      return;
    }

    // Cancel any pending frame
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    // Draw immediately
    lastDrawRef.current = now;
    drawFnRef.current();
  }, [throttleMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return requestDraw;
}

// ============================================
// Canvas Drawing Utilities
// ============================================

/**
 * Draw a tooltip near a point on the canvas.
 */
export function drawTooltip(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    padding?: number;
    offsetX?: number;
    offsetY?: number;
  } = {}
): void {
  const {
    backgroundColor = 'rgba(26, 26, 46, 0.9)',
    textColor = '#ffffff',
    fontSize = 12,
    padding = 6,
    offsetX = 10,
    offsetY = -20,
  } = options;

  ctx.save();

  // Set font for measuring
  ctx.font = `${fontSize}px sans-serif`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;

  const boxWidth = textWidth + padding * 2;
  const boxHeight = textHeight + padding * 2;
  const boxX = x + offsetX;
  const boxY = y + offsetY - boxHeight;

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
  ctx.fill();

  // Draw text
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(text, boxX + padding, boxY + padding);

  ctx.restore();
}

/**
 * Format a measurement value for display.
 */
export function formatMeasurementValue(value: number, unit: string, precision: number = 2): string {
  const formattedValue = value.toFixed(precision);
  return `${formattedValue} ${unit}`;
}

export default {
  throttle,
  debounce,
  useThrottledCallback,
  useDebouncedCallback,
  useAnimationFrame,
  useThrottledDraw,
  drawTooltip,
  formatMeasurementValue,
};
