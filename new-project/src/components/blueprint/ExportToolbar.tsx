import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, FileSpreadsheet, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { exportMeasurementsToPDF } from '@/lib/measurementExport';
import { exportMeasurementsToExcel } from '@/lib/excelExport';
import type { Measurement, MeasurementExportData, MeasurementType, CostEstimateData, ExportOptions } from '@/types';

interface ExportToolbarProps {
  measurements: Measurement[];
  projectId: string;
  projectName: string;
  projectLogo?: string;
  costEstimate?: CostEstimateData;
  className?: string;
}

export function ExportToolbar({
  measurements,
  projectId,
  projectName,
  projectLogo,
  costEstimate,
  className = '',
}: ExportToolbarProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCosts: true,
    includeTimeline: true,
    includeTotals: true,
    language: isArabic ? 'ar' : 'en',
    projectLogo,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Calculate totals and counts from measurements
  const { totals, counts } = useMemo(() => {
    const totals: Record<MeasurementType, number> = {
      distance: 0,
      area: 0,
      volume: 0,
      perimeter: 0,
      angle: 0,
    };
    const counts: Record<MeasurementType, number> = {
      distance: 0,
      area: 0,
      volume: 0,
      perimeter: 0,
      angle: 0,
    };

    measurements.forEach((m) => {
      if (totals[m.type] !== undefined) {
        totals[m.type] += m.value;
        counts[m.type]++;
      }
    });

    return { totals, counts };
  }, [measurements]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    const exportData: MeasurementExportData = {
      projectId,
      projectName,
      projectLogo,
      measurements,
      totals,
      counts,
      costEstimate,
      generatedAt: new Date(),
    };

    try {
      if (exportOptions.format === 'pdf') {
        await exportMeasurementsToPDF(exportData, {
          language: exportOptions.language,
          includeCosts: exportOptions.includeCosts,
          includeTimeline: exportOptions.includeTimeline,
          includeTotals: exportOptions.includeTotals,
        });
      } else {
        exportMeasurementsToExcel(exportData);
      }
      setExportSuccess(true);
      setTimeout(() => {
        setShowExportModal(false);
        setExportSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleOption = (key: keyof Pick<ExportOptions, 'includeCosts' | 'includeTimeline' | 'includeTotals'>) => {
    setExportOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      {/* Export Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowExportModal(true)}
        title={isArabic ? 'تصدير القياسات' : 'Export Measurements'}
        disabled={measurements.length === 0}
        className={className}
      >
        <Download className="w-4 h-4" />
      </Button>

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                {isArabic ? 'تصدير القياسات' : 'Export Measurements'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowExportModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Format Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {isArabic ? 'التنسيق' : 'Format'}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setExportOptions((prev) => ({ ...prev, format: 'pdf' }))}
                  className={`flex-1 p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                    exportOptions.format === 'pdf'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`w-6 h-6 ${exportOptions.format === 'pdf' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${exportOptions.format === 'pdf' ? 'text-primary' : 'text-gray-600'}`}>
                    PDF
                  </span>
                </button>
                <button
                  onClick={() => setExportOptions((prev) => ({ ...prev, format: 'excel' }))}
                  className={`flex-1 p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                    exportOptions.format === 'excel'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileSpreadsheet className={`w-6 h-6 ${exportOptions.format === 'excel' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${exportOptions.format === 'excel' ? 'text-primary' : 'text-gray-600'}`}>
                    Excel
                  </span>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="mb-4 space-y-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {isArabic ? 'الخيارات' : 'Options'}
              </label>

              <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeTotals}
                  onChange={() => toggleOption('includeTotals')}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  {isArabic ? 'تضمين الإجماليات' : 'Include totals summary'}
                </span>
              </label>

              <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCosts}
                  onChange={() => toggleOption('includeCosts')}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  {isArabic ? 'تضمين تقديرات التكلفة' : 'Include cost estimates'}
                </span>
              </label>

              <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeTimeline}
                  onChange={() => toggleOption('includeTimeline')}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  {isArabic ? 'تضمين الجدول الزمني' : 'Include measurement timeline'}
                </span>
              </label>
            </div>

            {/* Language (PDF only) */}
            {exportOptions.format === 'pdf' && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {isArabic ? 'اللغة' : 'Language'}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportOptions((prev) => ({ ...prev, language: 'en' }))}
                    className={`flex-1 py-2 px-4 rounded border-2 text-sm font-medium transition-colors ${
                      exportOptions.language === 'en'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setExportOptions((prev) => ({ ...prev, language: 'ar' }))}
                    className={`flex-1 py-2 px-4 rounded border-2 text-sm font-medium transition-colors ${
                      exportOptions.language === 'ar'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    العربية
                  </button>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {isArabic ? 'سيتم تصدير' : 'Will export'}{' '}
                <span className="font-semibold text-gray-900">{measurements.length}</span>{' '}
                {isArabic ? 'قياس' : 'measurements'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleExport}
                disabled={isExporting || measurements.length === 0}
              >
                {isExporting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isArabic ? 'جاري التصدير...' : 'Exporting...'}
                  </span>
                ) : exportSuccess ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {isArabic ? 'تم التصدير!' : 'Exported!'}
                  </span>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-1" />
                    {isArabic ? 'تصدير' : 'Export'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExportToolbar;
