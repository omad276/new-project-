import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Maximize2,
  Minimize2,
  Ruler,
  Square,
  Trash2,
  Layers,
  Eye,
  EyeOff,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  FileText,
  Scale,
  X,
  Triangle,
  Box,
  AlertTriangle,
  Undo2,
  Redo2,
  Grid3X3,
  Magnet,
  Download,
  BarChart3,
  Filter,
  DollarSign,
} from 'lucide-react';
import type { MapScale, ScaleUnit, Point, MeasurementType, Measurement, SnapConfig, CostEstimateData } from '@/types';
import { useUndoRedo, createCommand } from '@/hooks/useUndoRedo';
import { applySnapping, drawGrid, drawSnapIndicator } from '@/lib/snapping';
import { useThrottledCallback, drawTooltip, formatMeasurementValue } from '@/lib/canvasUtils';
import { Button } from '@/components/ui/Button';
import { ExportToolbar } from './blueprint/ExportToolbar';
import { AnalyticsPanel } from './blueprint/AnalyticsPanel';
import { CostEstimatorModal } from './blueprint/CostEstimatorModal';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ============================================
// Types
// ============================================

interface BlueprintViewerProps {
  src: string;
  alt?: string;
  measurements?: Measurement[];
  onMeasurementCreate?: (measurement: Omit<Measurement, 'id' | 'mapId' | 'createdAt' | 'updatedAt'>) => void;
  onMeasurementDelete?: (id: string) => void;
  onMeasurementRestore?: (measurement: Measurement) => void;
  showMeasurements?: boolean;
  editable?: boolean;
  className?: string;
  mapScale?: MapScale;
  isCalibrated?: boolean;
  onCalibrate?: (data: { pixelDistance: number; realDistance: number; unit: ScaleUnit }) => void;
  // New props for enhanced features
  projectId?: string;
  projectName?: string;
  projectLogo?: string;
  showAnalytics?: boolean;
  showExport?: boolean;
}

type Tool = 'pan' | 'distance' | 'area' | 'angle' | 'volume' | 'perimeter' | 'calibrate';

// ============================================
// Component
// ============================================

export function BlueprintViewer({
  src,
  alt = 'Blueprint',
  measurements = [],
  onMeasurementCreate,
  onMeasurementDelete,
  onMeasurementRestore,
  showMeasurements = true,
  editable = false,
  className = '',
  mapScale,
  isCalibrated = false,
  onCalibrate,
  projectId,
  projectName = 'Blueprint Project',
  projectLogo,
  showAnalytics = true,
  showExport = true,
}: BlueprintViewerProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pdfPageRef = useRef<HTMLCanvasElement | null>(null);

  // State
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('pan');
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [showLayers, setShowLayers] = useState(true);
  const [visibleMeasurements, setVisibleMeasurements] = useState<Set<string>>(
    new Set(measurements.map((m) => m.id))
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);

  // PDF-specific state
  const [isPdf, setIsPdf] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Calibration state
  const [calibrationPoints, setCalibrationPoints] = useState<Point[]>([]);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [calibrationDistance, setCalibrationDistance] = useState('');
  const [calibrationUnit, setCalibrationUnit] = useState<ScaleUnit>('m');
  const [showCalibrationWarning, setShowCalibrationWarning] = useState(false);
  const [calibrationError, setCalibrationError] = useState<string | null>(null);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);

  // CAD file state
  const [isCad, setIsCad] = useState(false);

  // Volume tool state
  const [showVolumeHeightModal, setShowVolumeHeightModal] = useState(false);
  const [volumeHeight, setVolumeHeight] = useState('');
  const [volumeHeightUnit, setVolumeHeightUnit] = useState<'m' | 'cm' | 'ft'>('m');
  const [volumeHeightError, setVolumeHeightError] = useState<string | null>(null);

  // Validation state
  const [pointCountWarning, setPointCountWarning] = useState<string | null>(null);

  // Snapping state
  const [snapConfig, setSnapConfig] = useState<SnapConfig>({
    gridEnabled: false,
    gridSize: 20,
    pointSnapEnabled: true,
    snapRadius: 15,
    showGrid: false,
  });
  const [snapIndicator, setSnapIndicator] = useState<{ point: Point; type: 'point' | 'grid' } | null>(null);

  // Undo/Redo
  const { canUndo, canRedo, undo, redo, execute: executeCommand } = useUndoRedo(50);

  // Track deleted measurements for undo
  const deletedMeasurementsRef = useRef<Map<string, Measurement>>(new Map());

  // Type filter state
  const measurementTypes: MeasurementType[] = ['distance', 'area', 'angle', 'volume', 'perimeter'];
  const [visibleTypes, setVisibleTypes] = useState<Set<MeasurementType>>(new Set(measurementTypes));
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  // Analytics panel state
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);

  // Cost estimator modal state
  const [showCostEstimator, setShowCostEstimator] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimateData | undefined>(undefined);

  // Pending measurement for undo/redo tracking
  const pendingMeasurementRef = useRef<{
    data: Omit<Measurement, 'id' | 'mapId' | 'createdAt' | 'updatedAt'>;
    timestamp: number;
  } | null>(null);

  // Validation constants
  const MAX_POINTS = 1000;
  const MIN_AREA_POINTS = 3;

  // Colors for measurements
  const measurementColors = ['#FF5722', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800'];

  // ============================================
  // PDF Detection and Loading
  // ============================================

  const isPdfFile = useCallback((url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.pdf') || lowerUrl.includes('application/pdf');
  }, []);

  const isCadFile = useCallback((url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.dwg') || lowerUrl.endsWith('.dxf');
  }, []);

  // ============================================
  // Image/PDF Loading
  // ============================================

  useEffect(() => {
    const loadContent = async () => {
      setImageLoaded(false);
      setIsCad(false);

      // Check for CAD files first - they can't be rendered
      if (isCadFile(src)) {
        setIsCad(true);
        setIsPdf(false);
        return;
      }

      if (isPdfFile(src)) {
        setIsPdf(true);
        setPdfLoading(true);

        try {
          const loadingTask = pdfjsLib.getDocument(src);
          const pdf = await loadingTask.promise;
          pdfDocRef.current = pdf;
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          await renderPdfPage(pdf, 1);
          setImageLoaded(true);
        } catch (error) {
          console.error('Error loading PDF:', error);
        } finally {
          setPdfLoading(false);
        }
      } else {
        setIsPdf(false);
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setImageLoaded(true);
          centerImage();
        };
        img.onerror = () => {
          console.error('Error loading image:', src);
        };
        img.src = src;
      }
    };

    loadContent();

    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
    };
  }, [src, isPdfFile]);

  const renderPdfPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 }); // Higher scale for better quality

      // Create an off-screen canvas for the PDF page
      const pdfCanvas = document.createElement('canvas');
      pdfCanvas.width = viewport.width;
      pdfCanvas.height = viewport.height;
      const pdfCtx = pdfCanvas.getContext('2d');

      if (!pdfCtx) return;

      await page.render({
        canvasContext: pdfCtx,
        viewport: viewport,
      }).promise;

      // Store the rendered page as an image
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        pdfPageRef.current = pdfCanvas;
        centerImage();
        draw();
      };
      img.src = pdfCanvas.toDataURL();
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  };

  const goToPage = async (pageNum: number) => {
    if (!pdfDocRef.current || pageNum < 1 || pageNum > totalPages) return;

    setPdfLoading(true);
    setCurrentPage(pageNum);
    await renderPdfPage(pdfDocRef.current, pageNum);
    setPdfLoading(false);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // ============================================
  // Canvas Drawing
  // ============================================

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid first (behind everything) if enabled
    if (snapConfig.showGrid && snapConfig.gridEnabled) {
      drawGrid(ctx, canvas.width, canvas.height, {
        gridSize: snapConfig.gridSize,
        offset,
        scale,
      });
    }

    // Save context
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    // Restore context
    ctx.restore();

    // Draw measurements
    if (showMeasurements) {
      drawMeasurements(ctx);
    }

    // Draw current measurement in progress
    if (currentPoints.length > 0) {
      drawCurrentMeasurement(ctx);
    }

    // Draw live measurement preview
    if (activeTool !== 'pan' && activeTool !== 'calibrate' && currentPoints.length > 0 && cursorPosition) {
      drawLivePreview(ctx);
    }

    // Draw snap indicator
    if (snapIndicator && activeTool !== 'pan') {
      const screenPoint = transformPoint(snapIndicator.point);
      drawSnapIndicator(ctx, screenPoint, snapIndicator.type, 1);
    }

    // Draw cursor crosshair when measuring
    if (activeTool !== 'pan' && cursorPosition) {
      drawCrosshair(ctx, cursorPosition);
    }
  }, [scale, offset, rotation, showMeasurements, measurements, currentPoints, activeTool, cursorPosition, visibleMeasurements, calibrationPoints, snapConfig, snapIndicator, visibleTypes, filteredMeasurements]);

  useEffect(() => {
    draw();
  }, [draw, imageLoaded]);

  // ============================================
  // Drawing Helpers
  // ============================================

  const transformPoint = (point: Point): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return point;

    const centerX = canvas.width / 2 + offset.x;
    const centerY = canvas.height / 2 + offset.y;

    // Apply rotation
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const x = (point.x * cos - point.y * sin) * scale + centerX;
    const y = (point.x * sin + point.y * cos) * scale + centerY;

    return { x, y };
  };

  const inverseTransformPoint = (screenPoint: Point): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return screenPoint;

    const centerX = canvas.width / 2 + offset.x;
    const centerY = canvas.height / 2 + offset.y;

    // Remove offset
    let x = screenPoint.x - centerX;
    let y = screenPoint.y - centerY;

    // Remove scale
    x /= scale;
    y /= scale;

    // Remove rotation
    const rad = (-rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    };
  };

  // Check if a point is within the viewport (with margin for labels)
  const isPointInViewport = useCallback((point: Point, margin: number = 100): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const screenPoint = transformPoint(point);
    return (
      screenPoint.x >= -margin &&
      screenPoint.x <= canvas.width + margin &&
      screenPoint.y >= -margin &&
      screenPoint.y <= canvas.height + margin
    );
  }, [transformPoint]);

  // Check if any point of a measurement is visible
  const isMeasurementInViewport = useCallback((m: Measurement): boolean => {
    return m.points.some((p) => isPointInViewport(p));
  }, [isPointInViewport]);

  const drawMeasurements = (ctx: CanvasRenderingContext2D) => {
    // Filter by type visibility AND viewport culling for performance
    filteredMeasurements.forEach((measurement) => {
      if (!visibleMeasurements.has(measurement.id)) return;
      if (!isMeasurementInViewport(measurement)) return;

      const transformedPoints = measurement.points.map(transformPoint);

      ctx.strokeStyle = measurement.color;
      ctx.fillStyle = measurement.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      if (measurement.type === 'distance' && transformedPoints.length >= 2) {
        // Draw line
        ctx.beginPath();
        ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
        ctx.lineTo(transformedPoints[1].x, transformedPoints[1].y);
        ctx.stroke();

        // Draw endpoints
        transformedPoints.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw label
        const midX = (transformedPoints[0].x + transformedPoints[1].x) / 2;
        const midY = (transformedPoints[0].y + transformedPoints[1].y) / 2;
        drawLabel(ctx, `${measurement.value.toFixed(2)} ${measurement.unit}`, midX, midY - 10, measurement.color);
      } else if (measurement.type === 'area' && transformedPoints.length >= 3) {
        // Draw polygon
        ctx.beginPath();
        ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
        transformedPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();

        // Draw vertices
        transformedPoints.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw label at centroid
        const centroid = getCentroid(transformedPoints);
        drawLabel(ctx, `${measurement.value.toFixed(2)} ${measurement.unit}`, centroid.x, centroid.y, measurement.color);
      } else if (measurement.type === 'angle' && transformedPoints.length >= 3) {
        // Draw angle lines (A-B and B-C)
        ctx.beginPath();
        ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
        ctx.lineTo(transformedPoints[1].x, transformedPoints[1].y);
        ctx.lineTo(transformedPoints[2].x, transformedPoints[2].y);
        ctx.stroke();

        // Draw arc at vertex (point B)
        const vertex = transformedPoints[1];
        const angleA = Math.atan2(transformedPoints[0].y - vertex.y, transformedPoints[0].x - vertex.x);
        const angleC = Math.atan2(transformedPoints[2].y - vertex.y, transformedPoints[2].x - vertex.x);
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 25, Math.min(angleA, angleC), Math.max(angleA, angleC));
        ctx.stroke();

        // Draw points
        transformedPoints.forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, i === 1 ? 6 : 4, 0, Math.PI * 2); // Larger point for vertex
          ctx.fill();
        });

        // Draw label at vertex
        drawLabel(ctx, `${measurement.value.toFixed(1)}${measurement.unit}`, vertex.x, vertex.y - 35, measurement.color);
      } else if (measurement.type === 'volume' && transformedPoints.length >= 3) {
        // Draw filled base polygon
        ctx.beginPath();
        ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
        transformedPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();

        // Draw vertices
        transformedPoints.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw 3D indicator (vertical lines from corners)
        ctx.setLineDash([3, 3]);
        transformedPoints.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 8, p.y - 12);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // Draw label at centroid
        const centroid = getCentroid(transformedPoints);
        drawLabel(ctx, `${measurement.value.toFixed(2)} ${measurement.unit}`, centroid.x, centroid.y, measurement.color);
      } else if (measurement.type === 'perimeter' && transformedPoints.length >= 2) {
        // Draw polygon outline (no fill or lighter fill)
        ctx.beginPath();
        ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
        transformedPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.globalAlpha = 0.15;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();

        // Draw vertices
        transformedPoints.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw label at centroid
        const centroid = getCentroid(transformedPoints);
        drawLabel(ctx, `${measurement.value.toFixed(2)} ${measurement.unit}`, centroid.x, centroid.y, measurement.color);
      }
    });
  };

  const drawCurrentMeasurement = (ctx: CanvasRenderingContext2D) => {
    // Draw calibration points if in calibration mode
    if (activeTool === 'calibrate' && calibrationPoints.length > 0) {
      const transformedCalibPoints = calibrationPoints.map(transformPoint);
      ctx.strokeStyle = '#E91E63';
      ctx.fillStyle = '#E91E63';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(transformedCalibPoints[0].x, transformedCalibPoints[0].y);
      if (transformedCalibPoints.length > 1) {
        ctx.lineTo(transformedCalibPoints[1].x, transformedCalibPoints[1].y);
      } else if (cursorPosition) {
        ctx.lineTo(cursorPosition.x, cursorPosition.y);
      }
      ctx.stroke();

      ctx.setLineDash([]);
      transformedCalibPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    if (currentPoints.length === 0) return;

    const transformedPoints = currentPoints.map(transformPoint);
    const color = measurementColors[measurements.length % measurementColors.length];

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (activeTool === 'distance' && transformedPoints.length >= 1) {
      ctx.beginPath();
      ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
      if (transformedPoints.length > 1) {
        ctx.lineTo(transformedPoints[1].x, transformedPoints[1].y);
      } else if (cursorPosition) {
        ctx.lineTo(cursorPosition.x, cursorPosition.y);
      }
      ctx.stroke();
    } else if (activeTool === 'area' && transformedPoints.length >= 1) {
      ctx.beginPath();
      ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
      transformedPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      if (cursorPosition) {
        ctx.lineTo(cursorPosition.x, cursorPosition.y);
      }
      ctx.stroke();
    } else if (activeTool === 'angle' && transformedPoints.length >= 1) {
      ctx.beginPath();
      ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
      if (transformedPoints.length > 1) {
        ctx.lineTo(transformedPoints[1].x, transformedPoints[1].y);
        if (cursorPosition) {
          ctx.lineTo(cursorPosition.x, cursorPosition.y);
        }
      } else if (cursorPosition) {
        ctx.lineTo(cursorPosition.x, cursorPosition.y);
      }
      ctx.stroke();
    } else if (activeTool === 'volume' && transformedPoints.length >= 1) {
      // Draw polygon preview (same as area)
      ctx.beginPath();
      ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
      transformedPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      if (cursorPosition) {
        ctx.lineTo(cursorPosition.x, cursorPosition.y);
      }
      ctx.stroke();
    } else if (activeTool === 'perimeter' && transformedPoints.length >= 1) {
      // Draw polygon preview
      ctx.beginPath();
      ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
      transformedPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      if (cursorPosition) {
        ctx.lineTo(cursorPosition.x, cursorPosition.y);
      }
      ctx.stroke();
    }

    // Draw points
    ctx.setLineDash([]);
    transformedPoints.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawCrosshair = (ctx: CanvasRenderingContext2D, pos: Point) => {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, 0);
    ctx.lineTo(pos.x, canvas.height);
    ctx.moveTo(0, pos.y);
    ctx.lineTo(canvas.width, pos.y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawLabel = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) => {
    ctx.font = '12px Arial';
    const metrics = ctx.measureText(text);
    const padding = 4;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      x - metrics.width / 2 - padding,
      y - 8 - padding,
      metrics.width + padding * 2,
      16 + padding * 2
    );

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(
      x - metrics.width / 2 - padding,
      y - 8 - padding,
      metrics.width + padding * 2,
      16 + padding * 2
    );

    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  };

  const getCentroid = (points: Point[]): Point => {
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
  };

  // Draw live measurement preview while drawing
  const drawLivePreview = (ctx: CanvasRenderingContext2D) => {
    if (currentPoints.length === 0 || !cursorPosition) return;

    const imagePoint = inverseTransformPoint(cursorPosition);
    let previewText = '';

    if (activeTool === 'distance' && currentPoints.length === 1) {
      const distance = calculateDistance(currentPoints[0], imagePoint);
      previewText = formatMeasurementValue(distance, mapScale ? getDistanceUnit() : 'm');
    } else if (activeTool === 'area' && currentPoints.length >= 2) {
      const tempPoints = [...currentPoints, imagePoint];
      const area = calculatePolygonArea(tempPoints);
      previewText = formatMeasurementValue(area, mapScale ? getAreaUnit() : 'm²');
    } else if (activeTool === 'angle' && currentPoints.length === 2) {
      const angle = calculateAngle(currentPoints[0], currentPoints[1], imagePoint);
      previewText = `${angle.toFixed(1)}°`;
    } else if (activeTool === 'perimeter' && currentPoints.length >= 1) {
      const tempPoints = [...currentPoints, imagePoint];
      const perimeter = calculatePolygonPerimeter(tempPoints);
      previewText = formatMeasurementValue(perimeter, mapScale ? getDistanceUnit() : 'm');
    } else if (activeTool === 'volume' && currentPoints.length >= 2) {
      const tempPoints = [...currentPoints, imagePoint];
      const area = calculatePolygonArea(tempPoints);
      previewText = `Base: ${formatMeasurementValue(area, mapScale ? getAreaUnit() : 'm²')}`;
    }

    if (previewText) {
      drawTooltip(ctx, previewText, cursorPosition.x, cursorPosition.y, {
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        textColor: '#C5A572',
        fontSize: 13,
        offsetY: -30,
      });
    }
  };

  // Apply snapping to a point
  const applyPointSnapping = (point: Point): Point => {
    if (!snapConfig.gridEnabled && !snapConfig.pointSnapEnabled) {
      setSnapIndicator(null);
      return point;
    }

    const { point: snappedPoint, snappedTo } = applySnapping(point, snapConfig, measurements);

    if (snappedTo) {
      setSnapIndicator({ point: snappedPoint, type: snappedTo });
    } else {
      setSnapIndicator(null);
    }

    return snappedPoint;
  };

  // ============================================
  // Event Handlers
  // ============================================

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    } else if (activeTool === 'calibrate' && editable) {
      const rawPoint = inverseTransformPoint({ x, y });
      const imagePoint = applyPointSnapping(rawPoint);
      if (calibrationPoints.length === 0) {
        setCalibrationPoints([imagePoint]);
      } else {
        // Two points selected, show modal
        setCalibrationPoints([...calibrationPoints, imagePoint]);
        setShowCalibrationModal(true);
      }
    } else if (editable) {
      const rawPoint = inverseTransformPoint({ x, y });
      const imagePoint = applyPointSnapping(rawPoint);

      if (activeTool === 'distance') {
        if (currentPoints.length === 0) {
          setCurrentPoints([imagePoint]);
        } else {
          // Complete measurement
          const points = [...currentPoints, imagePoint];
          const distance = calculateDistance(points[0], points[1]);

          const measurementData = {
            type: 'distance' as MeasurementType,
            points,
            value: distance,
            unit: mapScale ? getDistanceUnit() : 'm',
            color: measurementColors[measurements.length % measurementColors.length],
            name: `Distance ${measurements.length + 1}`,
          };

          createMeasurementWithUndo(measurementData);
          setCurrentPoints([]);
        }
      } else if (activeTool === 'area') {
        setCurrentPoints([...currentPoints, imagePoint]);
      } else if (activeTool === 'angle') {
        if (currentPoints.length < 2) {
          setCurrentPoints([...currentPoints, imagePoint]);
        } else {
          // Complete angle measurement (3 points: A, B (vertex), C)
          const points = [...currentPoints, imagePoint];
          const angle = calculateAngle(points[0], points[1], points[2]);

          const measurementData = {
            type: 'angle' as MeasurementType,
            points,
            value: angle,
            unit: '°',
            color: measurementColors[measurements.length % measurementColors.length],
            name: `Angle ${measurements.length + 1}`,
          };

          createMeasurementWithUndo(measurementData);
          setCurrentPoints([]);
        }
      } else if (activeTool === 'volume') {
        // Volume: collect polygon points (like area), complete on double-click
        if (currentPoints.length >= MAX_POINTS) {
          setPointCountWarning(isArabic ? `الحد الأقصى ${MAX_POINTS} نقطة` : `Maximum ${MAX_POINTS} points`);
          setTimeout(() => setPointCountWarning(null), 3000);
          return;
        }
        setCurrentPoints([...currentPoints, imagePoint]);
      } else if (activeTool === 'perimeter') {
        // Perimeter: collect polygon points, complete on double-click
        if (currentPoints.length >= MAX_POINTS) {
          setPointCountWarning(isArabic ? `الحد الأقصى ${MAX_POINTS} نقطة` : `Maximum ${MAX_POINTS} points`);
          setTimeout(() => setPointCountWarning(null), 3000);
          return;
        }
        setCurrentPoints([...currentPoints, imagePoint]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPosition({ x, y });

    if (isDragging && activeTool === 'pan') {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (activeTool === 'area' && currentPoints.length >= 3 && editable) {
      const area = calculatePolygonArea(currentPoints);

      createMeasurementWithUndo({
        type: 'area',
        points: currentPoints,
        value: area,
        unit: mapScale ? getAreaUnit() : 'm²',
        color: measurementColors[measurements.length % measurementColors.length],
        name: `Area ${measurements.length + 1}`,
      });
      setCurrentPoints([]);
    } else if (activeTool === 'volume' && currentPoints.length >= MIN_AREA_POINTS && editable) {
      // Show height input modal for volume
      setVolumeHeight('');
      setVolumeHeightError(null);
      setShowVolumeHeightModal(true);
    } else if (activeTool === 'perimeter' && currentPoints.length >= 2 && editable) {
      const perimeter = calculatePolygonPerimeter(currentPoints);

      createMeasurementWithUndo({
        type: 'perimeter',
        points: currentPoints,
        value: perimeter,
        unit: mapScale ? getDistanceUnit() : 'm',
        color: measurementColors[measurements.length % measurementColors.length],
        name: `Perimeter ${measurements.length + 1}`,
      });
      setCurrentPoints([]);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.min(Math.max(s * delta, 0.1), 10));
  };

  // ============================================
  // Controls
  // ============================================

  const centerImage = () => {
    setOffset({ x: 0, y: 0 });
    setScale(1);
    setRotation(0);
  };

  const zoomIn = () => setScale((s) => Math.min(s * 1.2, 10));
  const zoomOut = () => setScale((s) => Math.max(s / 1.2, 0.1));
  const rotate = () => setRotation((r) => (r + 90) % 360);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMeasurementVisibility = (id: string) => {
    setVisibleMeasurements((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle all measurements visibility
  const showAllMeasurements = () => {
    setVisibleMeasurements(new Set(measurements.map((m) => m.id)));
  };

  const hideAllMeasurements = () => {
    setVisibleMeasurements(new Set());
  };

  // Toggle snap settings
  const toggleGridSnap = () => {
    setSnapConfig((prev) => ({
      ...prev,
      gridEnabled: !prev.gridEnabled,
      showGrid: !prev.gridEnabled, // Show grid when enabled
    }));
  };

  const togglePointSnap = () => {
    setSnapConfig((prev) => ({
      ...prev,
      pointSnapEnabled: !prev.pointSnapEnabled,
    }));
  };

  const cancelCurrentMeasurement = () => {
    setCurrentPoints([]);
    setActiveTool('pan');
  };

  // Toggle type visibility
  const toggleTypeVisibility = (type: MeasurementType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const showAllTypes = () => setVisibleTypes(new Set(measurementTypes));
  const hideAllTypes = () => setVisibleTypes(new Set());

  // Filter measurements by visible types
  const filteredMeasurements = measurements.filter((m) => visibleTypes.has(m.type));

  // Create measurement with undo/redo support
  const createMeasurementWithUndo = useCallback(
    (measurementData: Omit<Measurement, 'id' | 'mapId' | 'createdAt' | 'updatedAt'>) => {
      // Store pending measurement for tracking
      const timestamp = Date.now();
      pendingMeasurementRef.current = { data: measurementData, timestamp };

      // Find measurement after it's created (by matching properties)
      const findCreatedMeasurement = (): Measurement | null => {
        // Look for a measurement that matches our data
        return measurements.find(
          (m) =>
            m.type === measurementData.type &&
            m.color === measurementData.color &&
            m.name === measurementData.name &&
            JSON.stringify(m.points) === JSON.stringify(measurementData.points)
        ) || null;
      };

      const command = createCommand(
        'CREATE_MEASUREMENT',
        () => {
          onMeasurementCreate?.(measurementData);
        },
        () => {
          // Find the measurement that was created and delete it
          const createdMeasurement = findCreatedMeasurement();
          if (createdMeasurement) {
            deletedMeasurementsRef.current.set(createdMeasurement.id, createdMeasurement);
            onMeasurementDelete?.(createdMeasurement.id);
          }
        },
        `Create ${measurementData.type} measurement`
      );

      executeCommand(command);
    },
    [measurements, onMeasurementCreate, onMeasurementDelete, executeCommand]
  );

  // Delete measurement with undo/redo support
  const deleteMeasurementWithUndo = useCallback(
    (id: string) => {
      const measurement = measurements.find((m) => m.id === id);
      if (!measurement) return;

      // Store for potential restore
      deletedMeasurementsRef.current.set(id, measurement);

      const command = createCommand(
        'DELETE_MEASUREMENT',
        () => {
          onMeasurementDelete?.(id);
        },
        () => {
          // Restore the measurement
          const storedMeasurement = deletedMeasurementsRef.current.get(id);
          if (storedMeasurement && onMeasurementRestore) {
            onMeasurementRestore(storedMeasurement);
          }
        },
        `Delete ${measurement.type} measurement`
      );

      executeCommand(command);
    },
    [measurements, onMeasurementDelete, onMeasurementRestore, executeCommand]
  );

  // ============================================
  // Calculation Helpers
  // ============================================

  // Get the scale ratio (real units per pixel)
  const getScaleRatio = (): number => {
    if (mapScale?.ratio) {
      return mapScale.ratio;
    }
    // Default: 100px = 1m => ratio = 0.01
    return 0.01;
  };

  // Get distance unit from scale
  const getDistanceUnit = (): string => {
    return mapScale?.unit || 'm';
  };

  // Get area unit from scale
  const getAreaUnit = (): string => {
    const unit = mapScale?.unit || 'm';
    return unit === 'ft' || unit === 'in' ? 'ft²' : 'm²';
  };

  // Get volume unit from scale
  const getVolumeUnit = (): string => {
    const unit = mapScale?.unit || 'm';
    return unit === 'ft' || unit === 'in' ? 'ft³' : 'm³';
  };

  const calculateDistance = (p1: Point, p2: Point): number => {
    const pixelDistance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    return pixelDistance * getScaleRatio();
  };

  const calculatePolygonArea = (points: Point[]): number => {
    if (points.length < 3) return 0;
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    const pixelArea = Math.abs(area) / 2;
    const ratio = getScaleRatio();
    return pixelArea * ratio * ratio; // Scale squared for area
  };

  // Calculate angle between three points (in degrees)
  // Point B is the vertex of the angle
  const calculateAngle = (pointA: Point, pointB: Point, pointC: Point): number => {
    // Vectors from B to A and B to C
    const vectorBA = { x: pointA.x - pointB.x, y: pointA.y - pointB.y };
    const vectorBC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };

    // Dot product and cross product
    const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
    const crossProduct = vectorBA.x * vectorBC.y - vectorBA.y * vectorBC.x;

    // Calculate angle using atan2 for proper quadrant handling
    const angleRadians = Math.atan2(Math.abs(crossProduct), dotProduct);
    const angleDegrees = (angleRadians * 180) / Math.PI;

    return angleDegrees;
  };

  // Calculate perimeter of a polygon (sum of all edge distances)
  const calculatePolygonPerimeter = (points: Point[]): number => {
    if (points.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      perimeter += calculateDistance(points[i], points[j]);
    }
    return perimeter;
  };

  // Calculate volume (base area × height)
  const calculateVolume = (points: Point[], height: number): number => {
    const baseArea = calculatePolygonArea(points);
    return baseArea * height;
  };

  // Calculate pixel distance for calibration
  const calculatePixelDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Handle calibration submission
  const handleCalibrationSubmit = async () => {
    setCalibrationError(null);

    if (!calibrationDistance || calibrationPoints.length !== 2) {
      setCalibrationError(isArabic ? 'يرجى تحديد نقطتين وإدخال المسافة' : 'Please select two points and enter a distance');
      return;
    }

    const pixelDist = calculatePixelDistance(calibrationPoints[0], calibrationPoints[1]);
    const realDist = parseFloat(calibrationDistance);

    if (isNaN(realDist) || realDist <= 0) {
      setCalibrationError(isArabic ? 'يرجى إدخال مسافة صالحة أكبر من صفر' : 'Please enter a valid distance greater than zero');
      return;
    }

    if (pixelDist <= 0) {
      setCalibrationError(isArabic ? 'النقطتان متطابقتان، يرجى اختيار نقاط مختلفة' : 'Points are identical, please select different points');
      return;
    }

    try {
      await onCalibrate?.({
        pixelDistance: pixelDist,
        realDistance: realDist,
        unit: calibrationUnit,
      });

      // Show success message
      setCalibrationSuccess(true);
      setTimeout(() => setCalibrationSuccess(false), 3000);

      // Reset calibration state
      setCalibrationPoints([]);
      setShowCalibrationModal(false);
      setCalibrationDistance('');
      setActiveTool('pan');
    } catch (error) {
      setCalibrationError(
        error instanceof Error
          ? error.message
          : (isArabic ? 'فشلت المعايرة، يرجى المحاولة مرة أخرى' : 'Calibration failed, please try again')
      );
    }
  };

  // Cancel calibration
  const cancelCalibration = () => {
    setCalibrationPoints([]);
    setShowCalibrationModal(false);
    setCalibrationDistance('');
    setActiveTool('pan');
  };

  // ============================================
  // Resize Handler
  // ============================================

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        draw();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // ============================================
  // Render
  // ============================================

  return (
    <div
      ref={containerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: '500px' }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${activeTool === 'pan' ? 'cursor-grab' : 'cursor-crosshair'} ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      />

      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 flex gap-2 bg-white/90 backdrop-blur rounded-lg p-2 shadow-lg">
        {/* Undo/Redo */}
        {editable && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              title={isArabic ? 'تراجع (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
              className={!canUndo ? 'opacity-40' : ''}
            >
              <Undo2 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              title={isArabic ? 'إعادة (Ctrl+Y)' : 'Redo (Ctrl+Y)'}
              className={!canRedo ? 'opacity-40' : ''}
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            <div className="w-px bg-gray-300" />
          </>
        )}

        <Button
          variant={activeTool === 'pan' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => { setActiveTool('pan'); setCurrentPoints([]); }}
          title={isArabic ? 'تحريك' : 'Pan'}
        >
          <Move className="w-4 h-4" />
        </Button>

        {editable && (
          <>
            <Button
              variant={activeTool === 'calibrate' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => { setActiveTool('calibrate'); setCurrentPoints([]); setCalibrationPoints([]); }}
              title={isArabic ? 'معايرة المقياس' : 'Calibrate Scale'}
              className={!isCalibrated ? 'text-amber-600' : 'text-green-600'}
            >
              <Scale className="w-4 h-4" />
            </Button>

            <Button
              variant={activeTool === 'distance' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                if (!isCalibrated) {
                  setShowCalibrationWarning(true);
                  setTimeout(() => setShowCalibrationWarning(false), 3000);
                  return;
                }
                setActiveTool('distance');
                setCurrentPoints([]);
              }}
              title={isArabic ? 'قياس المسافة' : 'Measure Distance'}
              className={!isCalibrated ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Ruler className="w-4 h-4" />
            </Button>

            <Button
              variant={activeTool === 'area' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                if (!isCalibrated) {
                  setShowCalibrationWarning(true);
                  setTimeout(() => setShowCalibrationWarning(false), 3000);
                  return;
                }
                setActiveTool('area');
                setCurrentPoints([]);
              }}
              title={isArabic ? 'قياس المساحة' : 'Measure Area'}
              className={!isCalibrated ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Square className="w-4 h-4" />
            </Button>

            <Button
              variant={activeTool === 'angle' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                if (!isCalibrated) {
                  setShowCalibrationWarning(true);
                  setTimeout(() => setShowCalibrationWarning(false), 3000);
                  return;
                }
                setActiveTool('angle');
                setCurrentPoints([]);
              }}
              title={isArabic ? 'قياس الزاوية' : 'Measure Angle'}
              className={!isCalibrated ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Triangle className="w-4 h-4" />
            </Button>

            <Button
              variant={activeTool === 'volume' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                if (!isCalibrated) {
                  setShowCalibrationWarning(true);
                  setTimeout(() => setShowCalibrationWarning(false), 3000);
                  return;
                }
                setActiveTool('volume');
                setCurrentPoints([]);
              }}
              title={isArabic ? 'قياس الحجم' : 'Measure Volume'}
              className={!isCalibrated ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Box className="w-4 h-4" />
            </Button>

            <Button
              variant={activeTool === 'perimeter' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                if (!isCalibrated) {
                  setShowCalibrationWarning(true);
                  setTimeout(() => setShowCalibrationWarning(false), 3000);
                  return;
                }
                setActiveTool('perimeter');
                setCurrentPoints([]);
              }}
              title={isArabic ? 'قياس المحيط' : 'Measure Perimeter'}
              className={!isCalibrated ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>

            <div className="w-px bg-gray-300" />

            {/* Snap Controls */}
            <Button
              variant={snapConfig.gridEnabled ? 'primary' : 'ghost'}
              size="sm"
              onClick={toggleGridSnap}
              title={isArabic ? 'التقاط للشبكة' : 'Snap to Grid'}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>

            <Button
              variant={snapConfig.pointSnapEnabled ? 'primary' : 'ghost'}
              size="sm"
              onClick={togglePointSnap}
              title={isArabic ? 'التقاط للنقاط' : 'Snap to Points'}
            >
              <Magnet className="w-4 h-4" />
            </Button>
          </>
        )}

        <div className="w-px bg-gray-300" />

        <Button variant="ghost" size="sm" onClick={zoomIn} title={isArabic ? 'تكبير' : 'Zoom In'}>
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={zoomOut} title={isArabic ? 'تصغير' : 'Zoom Out'}>
          <ZoomOut className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={rotate} title={isArabic ? 'تدوير' : 'Rotate'}>
          <RotateCw className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={centerImage} title={isArabic ? 'توسيط' : 'Center'}>
          <Crosshair className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={toggleFullscreen} title={isArabic ? 'ملء الشاشة' : 'Fullscreen'}>
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>

        {/* Export and Analytics */}
        {showExport && measurements.length > 0 && (
          <>
            <div className="w-px bg-gray-300" />
            <ExportToolbar
              measurements={measurements}
              projectId={projectId || 'demo'}
              projectName={projectName}
              projectLogo={projectLogo}
              costEstimate={costEstimate}
            />
          </>
        )}

        {editable && projectId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCostEstimator(true)}
            title={isArabic ? 'تقدير التكلفة' : 'Cost Estimator'}
            disabled={measurements.length === 0}
          >
            <DollarSign className="w-4 h-4" />
          </Button>
        )}

        {showAnalytics && measurements.length > 0 && (
          <Button
            variant={showAnalyticsPanel ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            title={isArabic ? 'التحليلات' : 'Analytics'}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Scale Indicator, Calibration Badge & PDF Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {isCalibrated && mapScale ? (
          <div className="bg-green-500/90 backdrop-blur rounded-lg px-3 py-1 shadow-lg text-sm text-white flex items-center gap-1">
            <Scale className="w-4 h-4" />
            1px = {mapScale.ratio.toFixed(4)}{mapScale.unit}
          </div>
        ) : editable && (
          <div className="bg-amber-500/90 backdrop-blur rounded-lg px-3 py-1 shadow-lg text-sm text-white flex items-center gap-1">
            <Scale className="w-4 h-4" />
            {isArabic ? 'غير معاير' : 'Not Calibrated'}
          </div>
        )}
        {isPdf && (
          <div className="bg-red-500/90 backdrop-blur rounded-lg px-3 py-1 shadow-lg text-sm text-white flex items-center gap-1">
            <FileText className="w-4 h-4" />
            PDF
          </div>
        )}
        <div className="bg-white/90 backdrop-blur rounded-lg px-3 py-1 shadow-lg text-sm">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* PDF Page Navigation */}
      {isPdf && totalPages > 1 && (
        <div className="absolute top-16 right-4 flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg p-2 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevPage}
            disabled={currentPage <= 1 || pdfLoading}
            title={isArabic ? 'الصفحة السابقة' : 'Previous Page'}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm px-2 min-w-[60px] text-center">
            {currentPage} / {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextPage}
            disabled={currentPage >= totalPages || pdfLoading}
            title={isArabic ? 'الصفحة التالية' : 'Next Page'}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Measurements Panel */}
      {showMeasurements && measurements.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg max-w-xs">
          <div
            className="flex items-center justify-between px-3 py-2 border-b cursor-pointer"
            onClick={() => setShowLayers(!showLayers)}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isArabic ? 'القياسات' : 'Measurements'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{filteredMeasurements.length}/{measurements.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={(e) => { e.stopPropagation(); setShowTypeFilter(!showTypeFilter); }}
                title={isArabic ? 'تصفية حسب النوع' : 'Filter by type'}
              >
                <Filter className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {showLayers && (
            <>
              {/* Type Filter */}
              {showTypeFilter && (
                <div className="px-3 py-2 border-b bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-900">
                      {isArabic ? 'تصفية حسب النوع' : 'Filter by Type'}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs py-0 px-1 h-5"
                        onClick={showAllTypes}
                      >
                        {isArabic ? 'الكل' : 'All'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs py-0 px-1 h-5"
                        onClick={hideAllTypes}
                      >
                        {isArabic ? 'لا شيء' : 'None'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {measurementTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleTypeVisibility(type)}
                        className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                          visibleTypes.has(type)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {type === 'distance' && (isArabic ? 'مسافة' : 'Distance')}
                        {type === 'area' && (isArabic ? 'مساحة' : 'Area')}
                        {type === 'angle' && (isArabic ? 'زاوية' : 'Angle')}
                        {type === 'volume' && (isArabic ? 'حجم' : 'Volume')}
                        {type === 'perimeter' && (isArabic ? 'محيط' : 'Perimeter')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Show All / Hide All controls */}
              <div className="flex items-center justify-between px-3 py-1 border-b bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs py-0.5 px-2"
                  onClick={showAllMeasurements}
                  title={isArabic ? 'إظهار الكل' : 'Show All'}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {isArabic ? 'الكل' : 'All'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs py-0.5 px-2"
                  onClick={hideAllMeasurements}
                  title={isArabic ? 'إخفاء الكل' : 'Hide All'}
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  {isArabic ? 'إخفاء' : 'Hide'}
                </Button>
              </div>

              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
              {filteredMeasurements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="text-sm">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      {m.value.toFixed(2)} {m.unit}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1"
                      onClick={() => toggleMeasurementVisibility(m.id)}
                    >
                      {visibleMeasurements.has(m.id) ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>
                    {editable && onMeasurementDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 text-red-500 hover:text-red-700"
                        onClick={() => deleteMeasurementWithUndo(m.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Current Measurement Instructions */}
      {activeTool !== 'pan' && activeTool !== 'calibrate' && currentPoints.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
          <p className="text-sm">
            {activeTool === 'distance' && (
              isArabic ? 'انقر لتحديد النقطة الثانية' : 'Click to set second point'
            )}
            {activeTool === 'area' && (
              isArabic ? 'انقر لإضافة نقاط، انقر مزدوج للإنهاء' : 'Click to add points, double-click to finish'
            )}
            {activeTool === 'angle' && (
              currentPoints.length === 1
                ? (isArabic ? 'انقر لتحديد رأس الزاوية' : 'Click to set angle vertex')
                : (isArabic ? 'انقر لتحديد النقطة الثالثة' : 'Click to set third point')
            )}
            {activeTool === 'volume' && (
              currentPoints.length < MIN_AREA_POINTS
                ? (isArabic ? `انقر لإضافة نقاط القاعدة (${MIN_AREA_POINTS}+)` : `Click to add base points (${MIN_AREA_POINTS}+)`)
                : (isArabic ? 'انقر مزدوج لتحديد الارتفاع' : 'Double-click to enter height')
            )}
            {activeTool === 'perimeter' && (
              isArabic ? 'انقر لإضافة نقاط، انقر مزدوج للإنهاء' : 'Click to add points, double-click to finish'
            )}
          </p>
          {/* Point counter for polygon tools */}
          {(activeTool === 'area' || activeTool === 'volume' || activeTool === 'perimeter') && (
            <p className="text-xs text-gray-500 mt-1">
              {isArabic ? `النقاط: ${currentPoints.length}` : `Points: ${currentPoints.length}`}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 text-red-500"
            onClick={cancelCurrentMeasurement}
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      )}

      {/* Calibration Instructions */}
      {activeTool === 'calibrate' && !showCalibrationModal && (
        <div className="absolute bottom-4 right-4 bg-pink-50 border border-pink-200 backdrop-blur rounded-lg px-4 py-3 shadow-lg max-w-sm">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-pink-600" />
            <span className="font-medium text-pink-900">
              {isArabic ? 'معايرة المقياس' : 'Scale Calibration'}
            </span>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2 mb-3">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${calibrationPoints.length === step - 1
                    ? 'bg-pink-600 text-white'
                    : calibrationPoints.length >= step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                  {step}
                </div>
                {step < 2 && <div className="w-6 h-px bg-gray-300" />}
              </div>
            ))}
          </div>

          {/* Step Instructions */}
          <div className="text-sm text-pink-800 space-y-1">
            {calibrationPoints.length === 0 && (
              <div>
                <p className="font-medium">
                  {isArabic ? 'الخطوة 1: نقطة البداية' : 'Step 1: Start Point'}
                </p>
                <p className="text-xs text-pink-700">
                  {isArabic
                    ? 'انقر على بداية مسافة معروفة (مثل: باب، نافذة، جدار)'
                    : 'Click the start of a known distance (e.g., door, window, wall)'
                  }
                </p>
              </div>
            )}
            {calibrationPoints.length === 1 && (
              <div>
                <p className="font-medium">
                  {isArabic ? 'الخطوة 2: نقطة النهاية' : 'Step 2: End Point'}
                </p>
                <p className="text-xs text-pink-700">
                  {isArabic ? 'انقر على نهاية المسافة المعروفة' : 'Click the end of the known distance'}
                </p>
              </div>
            )}
          </div>

          {/* Tip */}
          <div className="mt-3 pt-2 border-t border-pink-200 text-xs text-pink-700">
            <p className="font-medium">{isArabic ? 'نصيحة:' : 'Tip:'}</p>
            <p>{isArabic ? 'اختر مسافة طويلة للحصول على دقة أفضل' : 'Choose a longer distance for better accuracy'}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-red-500 w-full"
            onClick={cancelCalibration}
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      )}

      {/* Calibration Required Warning */}
      {showCalibrationWarning && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-amber-100 border border-amber-300 backdrop-blur rounded-lg px-4 py-3 shadow-lg z-50">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-900">
              {isArabic ? 'يجب معايرة الخريطة أولاً' : 'Calibration Required'}
            </span>
          </div>
          <p className="text-sm text-amber-800 mt-1">
            {isArabic
              ? 'استخدم أداة المقياس لتعيين المسافة الحقيقية قبل إجراء القياسات'
              : 'Use the Scale tool to set real-world distance before measuring'}
          </p>
        </div>
      )}

      {/* Point Count Warning */}
      {pointCountWarning && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-amber-100 border border-amber-300 backdrop-blur rounded-lg px-4 py-3 shadow-lg z-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-900">
              {pointCountWarning}
            </span>
          </div>
        </div>
      )}

      {/* Calibration Success Notification */}
      {calibrationSuccess && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-300 backdrop-blur rounded-lg px-4 py-3 shadow-lg z-50">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">
              {isArabic ? 'تمت المعايرة بنجاح' : 'Calibration Successful'}
            </span>
          </div>
          <p className="text-sm text-green-800 mt-1">
            {isArabic
              ? 'يمكنك الآن استخدام أدوات القياس'
              : 'You can now use measurement tools'}
          </p>
        </div>
      )}

      {/* Calibration Modal */}
      {showCalibrationModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Scale className="w-5 h-5 text-pink-600" />
                {isArabic ? 'أدخل المسافة الحقيقية' : 'Enter Real Distance'}
              </h3>
              <Button variant="ghost" size="sm" onClick={cancelCalibration}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {isArabic
                ? 'ما هي المسافة الفعلية بين النقطتين المحددتين؟'
                : 'What is the actual distance between the two selected points?'
              }
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={calibrationDistance}
                onChange={(e) => { setCalibrationDistance(e.target.value); setCalibrationError(null); }}
                placeholder={isArabic ? 'المسافة' : 'Distance'}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                min="0"
                step="0.01"
                autoFocus
              />
              <select
                value={calibrationUnit}
                onChange={(e) => setCalibrationUnit(e.target.value as ScaleUnit)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="m">{isArabic ? 'متر' : 'Meters (m)'}</option>
                <option value="cm">{isArabic ? 'سنتيمتر' : 'Centimeters (cm)'}</option>
                <option value="mm">{isArabic ? 'ميليمتر' : 'Millimeters (mm)'}</option>
                <option value="ft">{isArabic ? 'قدم' : 'Feet (ft)'}</option>
                <option value="in">{isArabic ? 'بوصة' : 'Inches (in)'}</option>
              </select>
            </div>

            {calibrationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {calibrationError}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={cancelCalibration}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleCalibrationSubmit}
                disabled={!calibrationDistance || parseFloat(calibrationDistance) <= 0}
              >
                {isArabic ? 'معايرة' : 'Calibrate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Volume Height Modal */}
      {showVolumeHeightModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                {isArabic ? 'أدخل الارتفاع' : 'Enter Height'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowVolumeHeightModal(false);
                setVolumeHeight('');
                setVolumeHeightError(null);
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {isArabic
                ? 'أدخل ارتفاع الحجم لحساب الحجم الكلي'
                : 'Enter the height to calculate total volume'
              }
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={volumeHeight}
                onChange={(e) => { setVolumeHeight(e.target.value); setVolumeHeightError(null); }}
                placeholder={isArabic ? 'الارتفاع' : 'Height'}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                autoFocus
              />
              <select
                value={volumeHeightUnit}
                onChange={(e) => setVolumeHeightUnit(e.target.value as 'm' | 'cm' | 'ft')}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="m">{isArabic ? 'متر' : 'Meters (m)'}</option>
                <option value="cm">{isArabic ? 'سنتيمتر' : 'Centimeters (cm)'}</option>
                <option value="ft">{isArabic ? 'قدم' : 'Feet (ft)'}</option>
              </select>
            </div>

            {volumeHeightError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {volumeHeightError}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setShowVolumeHeightModal(false);
                  setVolumeHeight('');
                  setVolumeHeightError(null);
                  setCurrentPoints([]);
                }}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  if (!volumeHeight || parseFloat(volumeHeight) <= 0) {
                    setVolumeHeightError(isArabic ? 'يرجى إدخال ارتفاع صالح' : 'Please enter a valid height');
                    return;
                  }

                  // Convert height to meters based on unit
                  let heightInMeters = parseFloat(volumeHeight);
                  if (volumeHeightUnit === 'cm') {
                    heightInMeters = heightInMeters / 100;
                  } else if (volumeHeightUnit === 'ft') {
                    heightInMeters = heightInMeters * 0.3048;
                  }

                  // Calculate volume
                  const volume = calculateVolume(currentPoints, heightInMeters);

                  createMeasurementWithUndo({
                    type: 'volume',
                    points: currentPoints,
                    value: volume,
                    unit: getVolumeUnit(),
                    color: measurementColors[measurements.length % measurementColors.length],
                    name: `Volume ${measurements.length + 1}`,
                  });

                  // Reset state
                  setShowVolumeHeightModal(false);
                  setVolumeHeight('');
                  setVolumeHeightError(null);
                  setCurrentPoints([]);
                }}
                disabled={!volumeHeight || parseFloat(volumeHeight) <= 0}
              >
                {isArabic ? 'حساب الحجم' : 'Calculate Volume'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Panel */}
      {showAnalytics && showAnalyticsPanel && measurements.length > 0 && (
        <AnalyticsPanel
          measurements={measurements}
          projectId={projectId}
          className="absolute bottom-4 right-4"
          isExpanded={showAnalyticsPanel}
          onToggle={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
        />
      )}

      {/* Cost Estimator Modal */}
      {showCostEstimator && (
        <CostEstimatorModal
          isOpen={showCostEstimator}
          onClose={() => setShowCostEstimator(false)}
          measurements={measurements}
          projectId={projectId}
          onEstimateCreated={(estimate) => {
            setCostEstimate(estimate);
            setShowCostEstimator(false);
          }}
        />
      )}

      {/* CAD File Warning */}
      {isCad && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 max-w-md mx-4 text-center shadow-xl">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              {isArabic ? 'ملف CAD غير مدعوم' : 'CAD File Not Supported'}
            </h3>
            <p className="text-amber-800 mb-4">
              {isArabic
                ? 'لا يمكن عرض ملفات DWG و DXF مباشرة. يرجى تحويل الملف إلى PDF أو صورة PNG/JPG للاستخدام مع أدوات القياس.'
                : 'DWG and DXF files cannot be viewed directly. Please convert your file to PDF or PNG/JPG image to use measurement tools.'
              }
            </p>
            <div className="text-sm text-amber-700 text-start">
              <p className="font-medium mb-2">
                {isArabic ? 'طرق التحويل المقترحة:' : 'Suggested conversion methods:'}
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>{isArabic ? 'AutoCAD: ملف ← تصدير ← PDF' : 'AutoCAD: File → Export → PDF'}</li>
                <li>{isArabic ? 'أدوات مجانية عبر الإنترنت: Convertio, CloudConvert' : 'Free online tools: Convertio, CloudConvert'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isCad && (!imageLoaded || pdfLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            {isArabic ? 'جاري التحميل...' : 'Loading...'}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlueprintViewer;
