import { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Home,
  DollarSign,
  Maximize2,
  BedDouble,
  Bell,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { cn } from '@/lib/utils';
import type { SavedSearch } from './SavedSearchCard';

interface SavedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (search: Omit<SavedSearch, 'id' | 'matchCount' | 'lastChecked' | 'createdAt'>) => void;
  editSearch?: SavedSearch | null;
  isArabic: boolean;
}

const PROPERTY_TYPES = [
  { value: 'villa', labelEn: 'Villa', labelAr: 'فيلا' },
  { value: 'apartment', labelEn: 'Apartment', labelAr: 'شقة' },
  { value: 'office', labelEn: 'Office', labelAr: 'مكتب' },
  { value: 'land', labelEn: 'Land', labelAr: 'أرض' },
  { value: 'warehouse', labelEn: 'Warehouse', labelAr: 'مستودع' },
  { value: 'industrial', labelEn: 'Industrial', labelAr: 'صناعي' },
];

const LOCATIONS = [
  { value: 'riyadh', labelEn: 'Riyadh', labelAr: 'الرياض' },
  { value: 'jeddah', labelEn: 'Jeddah', labelAr: 'جدة' },
  { value: 'dammam', labelEn: 'Dammam', labelAr: 'الدمام' },
  { value: 'makkah', labelEn: 'Makkah', labelAr: 'مكة' },
  { value: 'madinah', labelEn: 'Madinah', labelAr: 'المدينة' },
];

export function SavedSearchModal({
  isOpen,
  onClose,
  onSave,
  editSearch,
  isArabic,
}: SavedSearchModalProps) {
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [minArea, setMinArea] = useState(0);
  const [maxArea, setMaxArea] = useState(1000);
  const [bedrooms, setBedrooms] = useState(0);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Reset form when modal opens/closes or editSearch changes
  useEffect(() => {
    if (isOpen && editSearch) {
      setName(editSearch.name);
      setNameAr(editSearch.nameAr);
      setLocation(editSearch.criteria.location || '');
      setPropertyType(editSearch.criteria.propertyType || '');
      setMinPrice(editSearch.criteria.minPrice || 0);
      setMaxPrice(editSearch.criteria.maxPrice || 5000000);
      setMinArea(editSearch.criteria.minArea || 0);
      setMaxArea(editSearch.criteria.maxArea || 1000);
      setBedrooms(editSearch.criteria.bedrooms || 0);
      setAlertsEnabled(editSearch.alertsEnabled);
    } else if (isOpen) {
      setName('');
      setNameAr('');
      setLocation('');
      setPropertyType('');
      setMinPrice(0);
      setMaxPrice(5000000);
      setMinArea(0);
      setMaxArea(1000);
      setBedrooms(0);
      setAlertsEnabled(true);
    }
  }, [isOpen, editSearch]);

  const handleSave = () => {
    const selectedLocation = LOCATIONS.find((l) => l.value === location);

    onSave({
      name: name || (isArabic ? 'بحث محفوظ جديد' : 'New Saved Search'),
      nameAr: nameAr || name || 'بحث محفوظ جديد',
      criteria: {
        location: selectedLocation?.labelEn,
        locationAr: selectedLocation?.labelAr,
        propertyType: propertyType || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 5000000 ? maxPrice : undefined,
        minArea: minArea > 0 ? minArea : undefined,
        maxArea: maxArea < 1000 ? maxArea : undefined,
        bedrooms: bedrooms > 0 ? bedrooms : undefined,
      },
      alertsEnabled,
    });
    onClose();
  };

  const formatMoney = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M SAR`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K SAR`;
    return `${value} SAR`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editSearch
          ? isArabic
            ? 'تعديل البحث المحفوظ'
            : 'Edit Saved Search'
          : isArabic
          ? 'حفظ بحث جديد'
          : 'Create Saved Search'
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Search Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={isArabic ? 'اسم البحث (English)' : 'Search Name (English)'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isArabic ? 'مثال: فلل الرياض' : 'e.g., Riyadh Villas'}
            leftIcon={<Search className="w-5 h-5" />}
          />
          <Input
            label={isArabic ? 'اسم البحث (عربي)' : 'Search Name (Arabic)'}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: فلل الرياض"
            leftIcon={<Search className="w-5 h-5" />}
            dir="rtl"
          />
        </div>

        {/* Location & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={isArabic ? 'الموقع' : 'Location'}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            options={[
              { value: '', label: isArabic ? 'جميع المواقع' : 'All Locations' },
              ...LOCATIONS.map((l) => ({
                value: l.value,
                label: isArabic ? l.labelAr : l.labelEn,
              })),
            ]}
          />
          <Select
            label={isArabic ? 'نوع العقار' : 'Property Type'}
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            options={[
              { value: '', label: isArabic ? 'جميع الأنواع' : 'All Types' },
              ...PROPERTY_TYPES.map((t) => ({
                value: t.value,
                label: isArabic ? t.labelAr : t.labelEn,
              })),
            ]}
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-4">
            {isArabic ? 'نطاق السعر' : 'Price Range'}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Slider
              label={isArabic ? 'الحد الأدنى' : 'Minimum'}
              min={0}
              max={5000000}
              step={100000}
              value={minPrice}
              onChange={setMinPrice}
              formatValue={formatMoney}
            />
            <Slider
              label={isArabic ? 'الحد الأقصى' : 'Maximum'}
              min={0}
              max={5000000}
              step={100000}
              value={maxPrice}
              onChange={setMaxPrice}
              formatValue={formatMoney}
            />
          </div>
        </div>

        {/* Area Range */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-4">
            {isArabic ? 'المساحة (م²)' : 'Area (sqm)'}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Slider
              label={isArabic ? 'الحد الأدنى' : 'Minimum'}
              min={0}
              max={1000}
              step={50}
              value={minArea}
              onChange={setMinArea}
              formatValue={(v) => `${v} m²`}
            />
            <Slider
              label={isArabic ? 'الحد الأقصى' : 'Maximum'}
              min={0}
              max={1000}
              step={50}
              value={maxArea}
              onChange={setMaxArea}
              formatValue={(v) => `${v} m²`}
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {isArabic ? 'غرف النوم' : 'Bedrooms'}
          </label>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setBedrooms(num)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  bedrooms === num
                    ? 'bg-primary text-background'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                )}
              >
                {num === 0 ? (isArabic ? 'الكل' : 'Any') : `${num}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Toggle */}
        <label className="flex items-center justify-between p-4 rounded-lg bg-background-secondary cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-medium block">
                {isArabic ? 'تفعيل التنبيهات' : 'Enable Alerts'}
              </span>
              <span className="text-sm text-text-muted">
                {isArabic
                  ? 'استلم إشعارات عند توفر عقارات جديدة'
                  : 'Get notified when new properties match'}
              </span>
            </div>
          </div>
          <div
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors',
              alertsEnabled ? 'bg-primary' : 'bg-background-tertiary'
            )}
            onClick={() => setAlertsEnabled(!alertsEnabled)}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                alertsEnabled
                  ? 'translate-x-6 rtl:-translate-x-6'
                  : 'translate-x-1 rtl:-translate-x-1'
              )}
            />
          </div>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave}>
            {editSearch
              ? isArabic
                ? 'حفظ التغييرات'
                : 'Save Changes'
              : isArabic
              ? 'حفظ البحث'
              : 'Save Search'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SavedSearchModal;
