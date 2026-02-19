import { useState } from 'react';
import {
  Search,
  Bell,
  BellOff,
  Trash2,
  MapPin,
  Home,
  DollarSign,
  Maximize2,
  Edit2,
  MoreVertical,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatPrice } from '@/lib/utils';

export interface SavedSearch {
  id: string;
  name: string;
  nameAr: string;
  criteria: {
    location?: string;
    locationAr?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    bedrooms?: number;
  };
  alertsEnabled: boolean;
  matchCount: number;
  lastChecked: Date;
  createdAt: Date;
}

interface SavedSearchCardProps {
  search: SavedSearch;
  isArabic: boolean;
  onToggleAlerts: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (search: SavedSearch) => void;
  onViewResults: (search: SavedSearch) => void;
}

export function SavedSearchCard({
  search,
  isArabic,
  onToggleAlerts,
  onDelete,
  onEdit,
  onViewResults,
}: SavedSearchCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const propertyTypeLabels: Record<string, { en: string; ar: string }> = {
    villa: { en: 'Villa', ar: 'فيلا' },
    apartment: { en: 'Apartment', ar: 'شقة' },
    office: { en: 'Office', ar: 'مكتب' },
    land: { en: 'Land', ar: 'أرض' },
    warehouse: { en: 'Warehouse', ar: 'مستودع' },
    industrial: { en: 'Industrial', ar: 'صناعي' },
  };

  const formatCriteria = () => {
    const parts: string[] = [];
    const c = search.criteria;

    if (c.location) {
      parts.push(isArabic ? c.locationAr || c.location : c.location);
    }
    if (c.propertyType) {
      const label = propertyTypeLabels[c.propertyType];
      parts.push(label ? (isArabic ? label.ar : label.en) : c.propertyType);
    }
    if (c.minPrice || c.maxPrice) {
      if (c.minPrice && c.maxPrice) {
        parts.push(`${formatPrice(c.minPrice, 'SAR', isArabic ? 'ar-SA' : 'en-US')} - ${formatPrice(c.maxPrice, 'SAR', isArabic ? 'ar-SA' : 'en-US')}`);
      } else if (c.minPrice) {
        parts.push(`${isArabic ? 'من' : 'From'} ${formatPrice(c.minPrice, 'SAR', isArabic ? 'ar-SA' : 'en-US')}`);
      } else if (c.maxPrice) {
        parts.push(`${isArabic ? 'حتى' : 'Up to'} ${formatPrice(c.maxPrice, 'SAR', isArabic ? 'ar-SA' : 'en-US')}`);
      }
    }
    if (c.bedrooms) {
      parts.push(`${c.bedrooms}+ ${isArabic ? 'غرف' : 'beds'}`);
    }

    return parts;
  };

  const criteriaItems = formatCriteria();

  return (
    <div className="bg-background-secondary rounded-xl p-4 hover:bg-background-tertiary/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary truncate">
                {isArabic ? search.nameAr : search.name}
              </h3>
              {search.alertsEnabled && (
                <Badge variant="success" size="sm">
                  <Bell className="w-3 h-3 me-1" />
                  {isArabic ? 'نشط' : 'Active'}
                </Badge>
              )}
            </div>

            {/* Criteria Tags */}
            <div className="flex flex-wrap gap-2 mt-2">
              {criteriaItems.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-background text-xs text-text-secondary"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Match count and last checked */}
            <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <Home className="w-4 h-4" />
                {search.matchCount} {isArabic ? 'نتيجة' : 'matches'}
              </span>
              <span>
                {isArabic ? 'آخر فحص:' : 'Last checked:'}{' '}
                {search.lastChecked.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewResults(search)}
          >
            {isArabic ? 'عرض النتائج' : 'View Results'}
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute end-0 top-full mt-1 z-20 bg-background rounded-lg shadow-lg border border-border py-1 min-w-[160px]">
                  <button
                    onClick={() => {
                      onToggleAlerts(search.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-background-secondary transition-colors"
                  >
                    {search.alertsEnabled ? (
                      <>
                        <BellOff className="w-4 h-4" />
                        {isArabic ? 'إيقاف التنبيهات' : 'Disable Alerts'}
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        {isArabic ? 'تفعيل التنبيهات' : 'Enable Alerts'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onEdit(search);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-background-secondary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    {isArabic ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={() => {
                      onDelete(search.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isArabic ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavedSearchCard;
