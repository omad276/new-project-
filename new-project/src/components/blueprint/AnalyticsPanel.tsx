import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Ruler,
  Square,
  Box,
  Triangle,
  Minimize2,
  DollarSign,
  Calendar,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { measurementApi } from '@/services/measurementApi';
import type { Measurement, MeasurementType, TimelineDataPoint } from '@/types';

interface AnalyticsPanelProps {
  measurements: Measurement[];
  projectId?: string;
  className?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

// Type icons mapping
const TYPE_ICONS: Record<MeasurementType, typeof Ruler> = {
  distance: Ruler,
  area: Square,
  volume: Box,
  angle: Triangle,
  perimeter: Minimize2,
};

// Type labels
const TYPE_LABELS: Record<MeasurementType, { en: string; ar: string }> = {
  distance: { en: 'Distance', ar: 'مسافة' },
  area: { en: 'Area', ar: 'مساحة' },
  volume: { en: 'Volume', ar: 'حجم' },
  angle: { en: 'Angle', ar: 'زاوية' },
  perimeter: { en: 'Perimeter', ar: 'محيط' },
};

// Unit labels
const TYPE_UNITS: Record<MeasurementType, string> = {
  distance: 'm',
  area: 'm\u00B2',
  volume: 'm\u00B3',
  angle: '\u00B0',
  perimeter: 'm',
};

// Type colors
const TYPE_COLORS: Record<MeasurementType, string> = {
  distance: '#2196F3',
  area: '#4CAF50',
  volume: '#9C27B0',
  angle: '#F44336',
  perimeter: '#FF9800',
};

export function AnalyticsPanel({
  measurements,
  projectId,
  className = '',
  isExpanded = true,
  onToggle,
}: AnalyticsPanelProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState<'summary' | 'costs' | 'timeline'>('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [costSummary, setCostSummary] = useState<{
    grandTotal: number;
    byCategory: Record<string, number>;
    currency: string;
  } | null>(null);

  // Calculate local analytics from measurements
  const localAnalytics = useMemo(() => {
    const totals: Record<MeasurementType, number> = {
      distance: 0,
      area: 0,
      volume: 0,
      angle: 0,
      perimeter: 0,
    };
    const counts: Record<MeasurementType, number> = {
      distance: 0,
      area: 0,
      volume: 0,
      angle: 0,
      perimeter: 0,
    };

    measurements.forEach((m) => {
      if (totals[m.type] !== undefined) {
        totals[m.type] += m.value;
        counts[m.type]++;
      }
    });

    // Build timeline data (group by date)
    const timelineMap = new Map<string, TimelineDataPoint>();
    measurements.forEach((m) => {
      const date = m.createdAt
        ? new Date(m.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      if (!timelineMap.has(date)) {
        timelineMap.set(date, {
          date,
          count: 0,
          totalArea: 0,
          totalVolume: 0,
          totalDistance: 0,
        });
      }

      const entry = timelineMap.get(date)!;
      entry.count++;
      if (m.type === 'area') entry.totalArea += m.value;
      if (m.type === 'volume') entry.totalVolume += m.value;
      if (m.type === 'distance') entry.totalDistance += m.value;
    });

    const timeline = Array.from(timelineMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return { totals, counts, timeline };
  }, [measurements]);

  // Fetch cost summary from backend if projectId is available
  const fetchCostSummary = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const summary = await measurementApi.getCostSummary(projectId);
      setCostSummary({
        grandTotal: summary.grandTotal,
        byCategory: summary.byCategory,
        currency: summary.currency,
      });
    } catch (error) {
      console.error('Failed to fetch cost summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && activeTab === 'costs') {
      fetchCostSummary();
    }
  }, [projectId, activeTab]);

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={`bg-white/90 backdrop-blur shadow-lg rounded-lg p-2 ${className}`}
        title={isArabic ? 'إظهار التحليلات' : 'Show Analytics'}
      >
        <BarChart3 className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div
      className={`bg-white/95 backdrop-blur rounded-lg shadow-lg w-80 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {isArabic ? 'التحليلات' : 'Analytics'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">
            {measurements.length} {isArabic ? 'قياس' : 'measurements'}
          </span>
          {onToggle && (
            <Button variant="ghost" size="sm" className="p-1" onClick={onToggle}>
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'summary'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isArabic ? 'ملخص' : 'Summary'}
        </button>
        <button
          onClick={() => setActiveTab('costs')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'costs'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isArabic ? 'التكلفة' : 'Costs'}
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'timeline'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isArabic ? 'الجدول' : 'Timeline'}
        </button>
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="p-3 space-y-2">
            {Object.entries(localAnalytics.totals)
              .filter(
                ([type]) =>
                  localAnalytics.counts[type as MeasurementType] > 0
              )
              .map(([type, total]) => {
                const Icon = TYPE_ICONS[type as MeasurementType];
                const label = TYPE_LABELS[type as MeasurementType];
                const unit = TYPE_UNITS[type as MeasurementType];
                const count = localAnalytics.counts[type as MeasurementType];
                const color = TYPE_COLORS[type as MeasurementType];

                return (
                  <div
                    key={type}
                    className="flex items-center justify-between p-2 rounded bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div>
                        <span className="text-sm font-medium">
                          {isArabic ? label.ar : label.en}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({count})
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold">
                      {total.toFixed(2)} {unit}
                    </span>
                  </div>
                );
              })}

            {measurements.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                {isArabic ? 'لا توجد قياسات بعد' : 'No measurements yet'}
              </p>
            )}

            {/* Total summary card */}
            {measurements.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-xs text-gray-600 mb-1">
                  {isArabic ? 'إجمالي القياسات' : 'Total Measurements'}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {measurements.length}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Costs Tab */}
        {activeTab === 'costs' && (
          <div className="p-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : costSummary && costSummary.grandTotal > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      {isArabic ? 'الإجمالي' : 'Grand Total'}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {costSummary.grandTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {costSummary.currency}
                  </span>
                </div>

                {/* Category breakdown */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {isArabic ? 'حسب الفئة' : 'By Category'}
                  </div>
                  {Object.entries(costSummary.byCategory)
                    .filter(([, amount]) => amount > 0)
                    .map(([category, amount]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className="text-gray-600 capitalize">
                          {category}
                        </span>
                        <span className="font-medium">
                          {amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          {costSummary.currency}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">
                  {isArabic
                    ? 'لا توجد تقديرات تكلفة'
                    : 'No cost estimates available'}
                </p>
                {projectId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchCostSummary}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {isArabic ? 'تحديث' : 'Refresh'}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="p-3">
            {localAnalytics.timeline.length > 0 ? (
              <div className="space-y-2">
                {localAnalytics.timeline.slice(-10).reverse().map((entry) => (
                  <div
                    key={entry.date}
                    className="flex items-center justify-between p-2 rounded bg-gray-50 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {new Date(entry.date).toLocaleDateString(
                          isArabic ? 'ar-SA' : 'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary">
                        {entry.count}
                      </span>
                      <span className="text-xs text-gray-500">
                        {isArabic ? 'قياس' : 'meas.'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Timeline summary */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {localAnalytics.timeline.reduce(
                          (sum, e) => sum + e.totalDistance,
                          0
                        ).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isArabic ? 'مسافة (م)' : 'Dist (m)'}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {localAnalytics.timeline.reduce(
                          (sum, e) => sum + e.totalArea,
                          0
                        ).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isArabic ? 'مساحة (م\u00B2)' : 'Area (m\u00B2)'}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        {localAnalytics.timeline.reduce(
                          (sum, e) => sum + e.totalVolume,
                          0
                        ).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isArabic ? 'حجم (م\u00B3)' : 'Vol (m\u00B3)'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {isArabic ? 'لا توجد بيانات زمنية' : 'No timeline data'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPanel;
