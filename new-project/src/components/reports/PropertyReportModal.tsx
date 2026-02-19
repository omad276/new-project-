import { useState } from 'react';
import { FileText, Download, ExternalLink, Settings, Loader2 } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { cn } from '@/lib/utils';
import {
  generatePropertyReport,
  downloadReport,
  openReportInNewWindow,
  type PropertyReportData,
  type ReportOptions,
} from '@/lib/reportGenerator';

interface PropertyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyReportData;
  isArabic: boolean;
}

export function PropertyReportModal({
  isOpen,
  onClose,
  property,
  isArabic,
}: PropertyReportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Report options
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMap, setIncludeMap] = useState(true);

  // Mortgage settings
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(5);
  const [termYears, setTermYears] = useState(25);

  const generateReport = async (openInNewWindow: boolean) => {
    setIsGenerating(true);

    try {
      const options: ReportOptions = {
        includeFinancials,
        includeImages,
        includeMap,
        language: isArabic ? 'ar' : 'en',
        mortgageSettings: {
          downPaymentPercent,
          interestRate,
          termYears,
        },
      };

      const doc = await generatePropertyReport(property, options);

      // Generate filename
      const sanitizedTitle = property.title
        .replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      const filename = `Upgreat_Property_Report_${sanitizedTitle}`;

      if (openInNewWindow) {
        openReportInNewWindow(doc);
      } else {
        downloadReport(doc, filename);
      }

      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const ToggleSwitch = ({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <label className="flex items-center justify-between p-3 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors cursor-pointer">
      <div>
        <span className="font-medium block">{label}</span>
        {description && <span className="text-sm text-text-muted">{description}</span>}
      </div>
      <div
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-background-tertiary'
        )}
        onClick={() => onChange(!checked)}
      >
        <div
          className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            checked ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
          )}
        />
      </div>
    </label>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isArabic ? 'تصدير تقرير العقار' : 'Export Property Report'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Property Preview */}
        <div className="flex items-center gap-4 p-4 bg-background-secondary rounded-lg">
          {property.images[0] && (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{property.title}</h3>
            <p className="text-sm text-text-muted">{property.city}</p>
            <p className="text-primary font-semibold">
              {property.price.toLocaleString()} {property.currency}
            </p>
          </div>
        </div>

        {/* Report Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-text-secondary">
            {isArabic ? 'محتويات التقرير' : 'Report Contents'}
          </h4>
          <ToggleSwitch
            checked={includeFinancials}
            onChange={setIncludeFinancials}
            label={isArabic ? 'التحليل المالي' : 'Financial Analysis'}
            description={
              isArabic
                ? 'تضمين حسابات التمويل والعائد'
                : 'Include mortgage calculations and ROI'
            }
          />
          <ToggleSwitch
            checked={includeImages}
            onChange={setIncludeImages}
            label={isArabic ? 'صور العقار' : 'Property Images'}
            description={isArabic ? 'تضمين صور المعرض' : 'Include gallery images'}
          />
          <ToggleSwitch
            checked={includeMap}
            onChange={setIncludeMap}
            label={isArabic ? 'خريطة الموقع' : 'Location Map'}
            description={isArabic ? 'تضمين صورة الموقع' : 'Include location map'}
          />
        </div>

        {/* Financial Settings */}
        {includeFinancials && (
          <div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Settings className="w-4 h-4" />
              {isArabic ? 'إعدادات التمويل' : 'Mortgage Settings'}
            </button>

            {showSettings && (
              <div className="mt-4 p-4 bg-background-secondary rounded-lg space-y-4">
                <Slider
                  label={isArabic ? 'الدفعة الأولى' : 'Down Payment'}
                  min={0}
                  max={50}
                  step={5}
                  value={downPaymentPercent}
                  onChange={setDownPaymentPercent}
                  formatValue={(v) => `${v}%`}
                />
                <Slider
                  label={isArabic ? 'معدل الفائدة' : 'Interest Rate'}
                  min={1}
                  max={15}
                  step={0.25}
                  value={interestRate}
                  onChange={setInterestRate}
                  formatValue={(v) => `${v}%`}
                />
                <Slider
                  label={isArabic ? 'مدة القرض (سنوات)' : 'Loan Term (years)'}
                  min={5}
                  max={30}
                  step={5}
                  value={termYears}
                  onChange={setTermYears}
                  formatValue={(v) => `${v}`}
                />
              </div>
            )}
          </div>
        )}

        {/* Report Preview Info */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-text-primary">
                {isArabic ? 'معاينة التقرير' : 'Report Preview'}
              </h4>
              <p className="text-sm text-text-secondary mt-1">
                {isArabic
                  ? 'سيتضمن التقرير: المواصفات الأساسية، الوصف، المميزات'
                  : 'The report will include: Key specs, description, features'}
                {includeFinancials &&
                  (isArabic ? '، التحليل المالي' : ', financial analysis')}
                {includeMap && (isArabic ? '، الموقع' : ', location')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isGenerating}>
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          variant="outline"
          onClick={() => generateReport(true)}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ExternalLink className="w-4 h-4" />
          )}
          {isArabic ? 'معاينة' : 'Preview'}
        </Button>
        <Button onClick={() => generateReport(false)} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isArabic ? 'تحميل PDF' : 'Download PDF'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default PropertyReportModal;
