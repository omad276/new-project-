import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  X,
  Plus,
  Trash2,
  Calculator,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { measurementApi } from '@/services/measurementApi';
import type { Measurement, MeasurementType, CostItem, CostEstimateData } from '@/types';

interface CostEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurements: Measurement[];
  projectId?: string;
  onEstimateCreated?: (estimate: CostEstimateData) => void;
}

// Default unit costs per measurement type
const DEFAULT_UNIT_COSTS: Record<MeasurementType, { cost: number; unit: string }> = {
  area: { cost: 50, unit: 'm\u00B2' },
  distance: { cost: 25, unit: 'm' },
  volume: { cost: 100, unit: 'm\u00B3' },
  perimeter: { cost: 15, unit: 'm' },
  angle: { cost: 0, unit: '\u00B0' },
};

// Category options
const CATEGORIES: { value: CostItem['category']; labelEn: string; labelAr: string }[] = [
  { value: 'material', labelEn: 'Material', labelAr: 'مواد' },
  { value: 'labor', labelEn: 'Labor', labelAr: 'عمالة' },
  { value: 'equipment', labelEn: 'Equipment', labelAr: 'معدات' },
  { value: 'overhead', labelEn: 'Overhead', labelAr: 'نفقات عامة' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

export function CostEstimatorModal({
  isOpen,
  onClose,
  measurements,
  projectId,
  onEstimateCreated,
}: CostEstimatorModalProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Unit costs state
  const [unitCosts, setUnitCosts] = useState<Record<MeasurementType, number>>({
    area: DEFAULT_UNIT_COSTS.area.cost,
    distance: DEFAULT_UNIT_COSTS.distance.cost,
    volume: DEFAULT_UNIT_COSTS.volume.cost,
    perimeter: DEFAULT_UNIT_COSTS.perimeter.cost,
    angle: DEFAULT_UNIT_COSTS.angle.cost,
  });

  // Additional cost items
  const [additionalItems, setAdditionalItems] = useState<CostItem[]>([]);

  // Tax and settings
  const [taxRate, setTaxRate] = useState(15);
  const [currency, setCurrency] = useState('SAR');
  const [estimateName, setEstimateName] = useState('');

  // State
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals from measurements
  const measurementTotals = useMemo(() => {
    const totals: Record<MeasurementType, number> = {
      area: 0,
      distance: 0,
      volume: 0,
      perimeter: 0,
      angle: 0,
    };

    measurements.forEach((m) => {
      if (totals[m.type] !== undefined) {
        totals[m.type] += m.value;
      }
    });

    return totals;
  }, [measurements]);

  // Calculate costs from measurements
  const measurementCosts = useMemo(() => {
    const costs: { type: MeasurementType; total: number; quantity: number; unitCost: number }[] = [];

    Object.entries(measurementTotals).forEach(([type, quantity]) => {
      if (quantity > 0) {
        const unitCost = unitCosts[type as MeasurementType];
        costs.push({
          type: type as MeasurementType,
          quantity,
          unitCost,
          total: quantity * unitCost,
        });
      }
    });

    return costs;
  }, [measurementTotals, unitCosts]);

  // Calculate subtotal
  const subtotal = useMemo(() => {
    const measurementSubtotal = measurementCosts.reduce((sum, c) => sum + c.total, 0);
    const additionalSubtotal = additionalItems.reduce((sum, item) => sum + item.totalCost, 0);
    return measurementSubtotal + additionalSubtotal;
  }, [measurementCosts, additionalItems]);

  // Calculate tax and grand total
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  // Update unit cost
  const handleUnitCostChange = (type: MeasurementType, value: string) => {
    const cost = parseFloat(value) || 0;
    setUnitCosts((prev) => ({ ...prev, [type]: cost }));
  };

  // Add additional item
  const addAdditionalItem = () => {
    setAdditionalItems((prev) => [
      ...prev,
      {
        name: '',
        category: 'other',
        unitCost: 0,
        quantity: 1,
        unit: 'unit',
        totalCost: 0,
      },
    ]);
  };

  // Update additional item
  const updateAdditionalItem = (index: number, updates: Partial<CostItem>) => {
    setAdditionalItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...updates };
        updated.totalCost = updated.unitCost * updated.quantity;
        return updated;
      })
    );
  };

  // Remove additional item
  const removeAdditionalItem = (index: number) => {
    setAdditionalItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Save estimate
  const handleSave = async () => {
    if (!projectId) {
      setError(isArabic ? 'معرف المشروع مطلوب' : 'Project ID is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Build cost items from measurements
      const measurementItems: CostItem[] = measurementCosts.map((c) => ({
        name: `${c.type.charAt(0).toUpperCase() + c.type.slice(1)} Cost`,
        category: 'material' as const,
        unitCost: c.unitCost,
        quantity: c.quantity,
        unit: DEFAULT_UNIT_COSTS[c.type].unit,
        totalCost: c.total,
      }));

      const allItems = [...measurementItems, ...additionalItems.filter((i) => i.name)];

      const estimate = await measurementApi.createCostEstimate(projectId, {
        name: estimateName || `Estimate ${new Date().toLocaleDateString()}`,
        items: allItems,
        taxRate,
        currency,
        measurementIds: measurements.map((m) => m.id),
      });

      onEstimateCreated?.(estimate);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (isArabic ? 'فشل في حفظ التقدير' : 'Failed to save estimate')
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            {isArabic ? 'تقدير التكلفة' : 'Cost Estimator'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Estimate Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? 'اسم التقدير' : 'Estimate Name'}
            </label>
            <input
              type="text"
              value={estimateName}
              onChange={(e) => setEstimateName(e.target.value)}
              placeholder={isArabic ? 'تقدير جديد' : 'New Estimate'}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Unit Costs */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {isArabic ? 'تكلفة الوحدة' : 'Unit Costs'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(measurementTotals)
                .filter(([, qty]) => qty > 0)
                .map(([type]) => (
                  <div key={type} className="flex items-center gap-2">
                    <label className="flex-1 text-sm text-gray-600 capitalize">
                      {type}
                      <span className="text-xs text-gray-400 ml-1">
                        ({measurementTotals[type as MeasurementType].toFixed(2)}{' '}
                        {DEFAULT_UNIT_COSTS[type as MeasurementType].unit})
                      </span>
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={unitCosts[type as MeasurementType]}
                        onChange={(e) =>
                          handleUnitCostChange(type as MeasurementType, e.target.value)
                        }
                        className="w-20 px-2 py-1 border rounded text-sm text-right"
                        min="0"
                        step="0.01"
                      />
                      <span className="text-xs text-gray-500">
                        /{DEFAULT_UNIT_COSTS[type as MeasurementType].unit}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Measurement Costs Summary */}
          {measurementCosts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {isArabic ? 'تكاليف القياسات' : 'Measurement Costs'}
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {measurementCosts.map((c) => (
                  <div key={c.type} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-600">
                      {c.type} ({c.quantity.toFixed(2)} x {c.unitCost})
                    </span>
                    <span className="font-medium">
                      {c.total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      {currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                {isArabic ? 'بنود إضافية' : 'Additional Items'}
              </h4>
              <Button variant="ghost" size="sm" onClick={addAdditionalItem}>
                <Plus className="w-4 h-4 mr-1" />
                {isArabic ? 'إضافة' : 'Add'}
              </Button>
            </div>

            {additionalItems.length > 0 && (
              <div className="space-y-2">
                {additionalItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateAdditionalItem(index, { name: e.target.value })
                      }
                      placeholder={isArabic ? 'اسم البند' : 'Item name'}
                      className="col-span-4 px-2 py-1 border rounded text-sm"
                    />
                    <select
                      value={item.category}
                      onChange={(e) =>
                        updateAdditionalItem(index, {
                          category: e.target.value as CostItem['category'],
                        })
                      }
                      className="col-span-2 px-2 py-1 border rounded text-sm"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {isArabic ? cat.labelAr : cat.labelEn}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.unitCost}
                      onChange={(e) =>
                        updateAdditionalItem(index, {
                          unitCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Cost"
                      className="col-span-2 px-2 py-1 border rounded text-sm text-right"
                      min="0"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateAdditionalItem(index, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Qty"
                      className="col-span-2 px-2 py-1 border rounded text-sm text-right"
                      min="0"
                    />
                    <div className="col-span-1 text-right text-sm font-medium">
                      {item.totalCost.toFixed(0)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="col-span-1 p-1 text-red-500"
                      onClick={() => removeAdditionalItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tax and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'نسبة الضريبة (%)' : 'Tax Rate (%)'}
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'العملة' : 'Currency'}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="SAR">SAR - Saudi Riyal</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Footer - fixed */}
        <div className="border-t p-4">
          {/* Totals */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="font-medium">
                {subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {isArabic ? 'الضريبة' : 'Tax'} ({taxRate}%)
              </span>
              <span className="font-medium">
                {taxAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {currency}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold text-gray-900">
                {isArabic ? 'المجموع الكلي' : 'Grand Total'}
              </span>
              <span className="text-lg font-bold text-primary">
                {grandTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {currency}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isSaving}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSave}
              disabled={isSaving || !projectId}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  {isArabic ? 'حفظ التقدير' : 'Save Estimate'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostEstimatorModal;
