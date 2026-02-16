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
} from 'lucide-react';
import type { MapScale, ScaleUnit } from '@/types';
import { Button } from '@/components/ui/Button';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ============================================
// Types
// ============================================

interface Point {
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  type: 'distance' | 'area' | 'angle';
  points: Point[];
  value: number;
  unit: string;
  color: string;
  name: string;
}

interface BlueprintViewerProps {
  src: string;
  alt?: string;
  measurements?: Measurement[];
  onMeasurementCreate?: (measurement: Omit<Measurement, 'id'>) => void;
  onMeasurementDelete?: (id: string) => void;
  showMeasurements?: boolean;
  editable?: boolean;
  className?: string;
  mapScale?: MapScale;
  onCalibrate?: (data: { pixelDistance: number; realDistance: number; unit: ScaleUnit }) => void;
}

type Tool = 'pan' | 'distance' | 'area' | 'angle' | 'calibrate';

// ============================================
// Component
// ============================================

export function BlueprintViewer({
  src,
  alt = 'Blueprint',
  measurements = [],
  onMeasurementCreate,
  onMeasurementDelete,
  showMeasurements = true,
  editable = false,
  className = '',
  mapScale,
  onCalibrate,
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

  // Colors for measurements
  const measurementColors = ['#FF5722', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800'];

  // ============================================
  // PDF Detection and Loading
  // ============================================

  const isPdfFile = useCallback((url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.pdf') || lowerUrl.includes('application/pdf');
  }, []);

  // ============================================
  // Image/PDF Loading
  // ============================================

  useEffect(() => {
    const loadContent = async () => {
      setImageLoaded(false);

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

    // Draw cursor crosshair when measuring
    if (activeTool !== 'pan' && cursorPosition) {
      drawCrosshair(ctx, cursorPosition);
    }
  }, [scale, offset, rotation, showMeasurements, measurements, currentPoints, activeTool, cursorPosition, visibleMeasurements, calibrationPoints]);

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

  const drawMeasurements = (ctx: CanvasRenderingContext2D) => {
    measurements.forEach((measurement) => {
      if (!visibleMeasurements.has(measurement.id)) return;

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
      const imagePoint = inverseTransformPoint({ x, y });
      if (calibrationPoints.length === 0) {
        setCalibrationPoints([imagePoint]);
      } else {
        // Two points selected, show modal
        setCalibrationPoints([...calibrationPoints, imagePoint]);
        setShowCalibrationModal(true);
      }
    } else if (editable) {
      const imagePoint = inverseTransformPoint({ x, y });

      if (activeTool === 'distance') {
        if (currentPoints.length === 0) {
          setCurrentPoints([imagePoint]);
        } else {
          // Complete measurement
          const points = [...currentPoints, imagePoint];
          const distance = calculateDistance(points[0], points[1]);

          onMeasurementCreate?.({
            type: 'distance',
            points,
            value: distance,
            unit: mapScale ? getDistanceUnit() : 'm',
            color: measurementColors[measurements.length % measurementColors.length],
            name: `Distance ${measurements.length + 1}`,
          });
          setCurrentPoints([]);
        }
      } else if (activeTool === 'area') {
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

      onMeasurementCreate?.({
        type: 'area',
        points: currentPoints,
        value: area,
        unit: mapScale ? getAreaUnit() : 'm²',
        color: measurementColors[measurements.length % measurementColors.length],
        name: `Area ${measurements.length + 1}`,
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

  const cancelCurrentMeasurement = () => {
    setCurrentPoints([]);
    setActiveTool('pan');
  };

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

  // Calculate pixel distance for calibration
  const calculatePixelDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Handle calibration submission
  const handleCalibrationSubmit = () => {
    if (!calibrationDistance || calibrationPoints.length !== 2) return;

    const pixelDist = calculatePixelDistance(calibrationPoints[0], calibrationPoints[1]);
    const realDist = parseFloat(calibrationDistance);

    if (pixelDist <= 0 || realDist <= 0 || isNaN(realDist)) return;

    onCalibrate?.({
      pixelDistance: pixelDist,
      realDistance: realDist,
      unit: calibrationUnit,
    });

    // Reset calibration state
    setCalibrationPoints([]);
    setShowCalibrationModal(false);
    setCalibrationDistance('');
    setActiveTool('pan');
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
              className={!mapScale ? 'text-amber-600' : ''}
            >
              <Scale className="w-4 h-4" />
            </Button>

            <Button
              variant={activeTool === 'distance' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => { setActiveTool('distance'); setCurrentPoints([]); }}
              title={isArabic ? 'قياس المسافة' : 'Measure Distance'}
            >
              <Ruler className="w-4 h-4" />
            </Button>

            <Button
              variant={activeTool === 'area' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => { setActiveTool('area'); setCurrentPoints([]); }}
              title={isArabic ? 'قياس المساحة' : 'Measure Area'}
            >
              <Square className="w-4 h-4" />
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
      </div>

      {/* Scale Indicator, Calibration Badge & PDF Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {mapScale ? (
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
            <span className="text-xs text-gray-500">{measurements.length}</span>
          </div>

          {showLayers && (
            <div className="max-h-48 overflow-y-auto p-2 space-y-1">
              {measurements.map((m) => (
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
                        onClick={() => onMeasurementDelete(m.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
          </p>
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
        <div className="absolute bottom-4 right-4 bg-pink-50 border border-pink-200 backdrop-blur rounded-lg px-4 py-3 shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 text-pink-600" />
            <span className="font-medium text-pink-900">
              {isArabic ? 'معايرة المقياس' : 'Scale Calibration'}
            </span>
          </div>
          <p className="text-sm text-pink-800">
            {calibrationPoints.length === 0
              ? (isArabic ? 'انقر على نقطة البداية لمسافة معروفة' : 'Click the start point of a known distance')
              : (isArabic ? 'انقر على نقطة النهاية' : 'Click the end point')
            }
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-red-500"
            onClick={cancelCalibration}
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
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
                onChange={(e) => setCalibrationDistance(e.target.value)}
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

      {/* Loading State */}
      {(!imageLoaded || pdfLoading) && (
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
