import type { Point, Measurement, SnapConfig } from '@/types';

/**
 * Snap a point to the nearest grid intersection.
 */
export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
    z: point.z,
  };
}

/**
 * Find the nearest existing point within the snap radius.
 * Returns null if no point is within range.
 */
export function snapToPoint(
  point: Point,
  existingPoints: Point[],
  snapRadius: number
): Point | null {
  let nearestPoint: Point | null = null;
  let nearestDistance = snapRadius;

  for (const existing of existingPoints) {
    const distance = calculateDistance(point, existing);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPoint = existing;
    }
  }

  return nearestPoint;
}

/**
 * Extract all vertices from measurements for point snapping.
 */
export function extractMeasurementVertices(measurements: Measurement[]): Point[] {
  const vertices: Point[] = [];

  for (const measurement of measurements) {
    for (const point of measurement.points) {
      vertices.push(point);
    }
  }

  return vertices;
}

/**
 * Find the nearest vertex from all measurements.
 */
export function findNearestVertex(
  point: Point,
  measurements: Measurement[],
  snapRadius: number
): Point | null {
  const vertices = extractMeasurementVertices(measurements);
  return snapToPoint(point, vertices, snapRadius);
}

/**
 * Apply snapping based on configuration.
 * Tries point snapping first, then grid snapping.
 */
export function applySnapping(
  point: Point,
  config: SnapConfig,
  measurements: Measurement[] = []
): { point: Point; snappedTo: 'point' | 'grid' | null } {
  // Try point snapping first (higher priority)
  if (config.pointSnapEnabled) {
    const snappedPoint = findNearestVertex(point, measurements, config.snapRadius);
    if (snappedPoint) {
      return { point: snappedPoint, snappedTo: 'point' };
    }
  }

  // Try grid snapping
  if (config.gridEnabled) {
    const snappedPoint = snapToGrid(point, config.gridSize);
    return { point: snappedPoint, snappedTo: 'grid' };
  }

  // No snapping
  return { point, snappedTo: null };
}

/**
 * Calculate distance between two points.
 */
function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ============================================
// Grid Drawing Functions
// ============================================

export interface GridDrawOptions {
  gridSize: number;
  offset: Point;
  scale: number;
  color?: string;
  lineWidth?: number;
  majorGridEvery?: number;
  majorColor?: string;
}

/**
 * Draw a grid overlay on the canvas.
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  options: GridDrawOptions
): void {
  const {
    gridSize,
    offset,
    scale,
    color = 'rgba(200, 200, 200, 0.3)',
    lineWidth = 0.5,
    majorGridEvery = 5,
    majorColor = 'rgba(150, 150, 150, 0.5)',
  } = options;

  const scaledGridSize = gridSize * scale;

  // Don't draw grid if too small to see
  if (scaledGridSize < 5) return;

  ctx.save();

  // Calculate grid start positions (accounting for offset)
  const startX = (offset.x % scaledGridSize) - scaledGridSize;
  const startY = (offset.y % scaledGridSize) - scaledGridSize;

  // Calculate grid line indices for major grid detection
  const offsetIndexX = Math.floor(-offset.x / scaledGridSize);
  const offsetIndexY = Math.floor(-offset.y / scaledGridSize);

  // Draw vertical lines
  for (let x = startX, i = 0; x < canvasWidth + scaledGridSize; x += scaledGridSize, i++) {
    const isMajor = (offsetIndexX + i) % majorGridEvery === 0;
    ctx.beginPath();
    ctx.strokeStyle = isMajor ? majorColor : color;
    ctx.lineWidth = isMajor ? lineWidth * 2 : lineWidth;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = startY, i = 0; y < canvasHeight + scaledGridSize; y += scaledGridSize, i++) {
    const isMajor = (offsetIndexY + i) % majorGridEvery === 0;
    ctx.beginPath();
    ctx.strokeStyle = isMajor ? majorColor : color;
    ctx.lineWidth = isMajor ? lineWidth * 2 : lineWidth;
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw a snap indicator (visual feedback when snapping).
 */
export function drawSnapIndicator(
  ctx: CanvasRenderingContext2D,
  point: Point,
  snappedTo: 'point' | 'grid',
  scale: number = 1
): void {
  ctx.save();

  const size = snappedTo === 'point' ? 8 : 6;
  const color = snappedTo === 'point' ? '#22C55E' : '#C5A572';

  ctx.beginPath();
  ctx.arc(point.x, point.y, size / scale, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  // Draw crosshairs for point snap
  if (snappedTo === 'point') {
    const crossSize = 12 / scale;
    ctx.beginPath();
    ctx.moveTo(point.x - crossSize, point.y);
    ctx.lineTo(point.x + crossSize, point.y);
    ctx.moveTo(point.x, point.y - crossSize);
    ctx.lineTo(point.x, point.y + crossSize);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 / scale;
    ctx.stroke();
  }

  ctx.restore();
}

export default {
  snapToGrid,
  snapToPoint,
  findNearestVertex,
  applySnapping,
  drawGrid,
  drawSnapIndicator,
};
