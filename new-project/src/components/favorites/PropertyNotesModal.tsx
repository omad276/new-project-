import { useState, useEffect } from 'react';
import { X, StickyNote, Save } from 'lucide-react';
import { Property } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/financial';

interface PropertyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyId: string, notes: string) => void;
  property: Property | null;
  currentNotes?: string;
  isArabic?: boolean;
}

export function PropertyNotesModal({
  isOpen,
  onClose,
  onSave,
  property,
  currentNotes = '',
  isArabic = false,
}: PropertyNotesModalProps) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(currentNotes);
  }, [currentNotes, isOpen]);

  if (!isOpen || !property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(property.id, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {isArabic ? 'ملاحظات العقار' : 'Property Notes'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property Preview */}
        <div className="p-4 border-b border-border bg-background-secondary/50">
          <div className="flex gap-3">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-medium">
                {isArabic ? property.titleAr : property.title}
              </h3>
              <p className="text-sm text-text-secondary">
                {isArabic ? property.location.cityAr : property.location.city}
              </p>
              <p className="text-sm text-primary font-medium mt-1">
                {formatCurrency(property.price, property.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {isArabic ? 'ملاحظاتك الشخصية' : 'Your Personal Notes'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isArabic
                  ? 'أضف ملاحظاتك حول هذا العقار...\n\nمثال:\n- سعر جيد للمنطقة\n- يحتاج تجديد للمطبخ\n- قريب من المدارس'
                  : 'Add your notes about this property...\n\nExample:\n- Good price for the area\n- Kitchen needs renovation\n- Close to schools'
              }
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
            <p className="text-xs text-text-muted mt-1">
              {isArabic
                ? 'هذه الملاحظات خاصة بك ولن تظهر لأحد'
                : 'These notes are private and only visible to you'}
            </p>
          </div>

          {/* Quick Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {isArabic ? 'إضافة سريعة' : 'Quick Add'}
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                isArabic ? '✓ سعر جيد' : '✓ Good price',
                isArabic ? '⚠ يحتاج صيانة' : '⚠ Needs work',
                isArabic ? '📍 موقع ممتاز' : '📍 Great location',
                isArabic ? '📞 تواصل مع المالك' : '📞 Contact owner',
                isArabic ? '🔄 للمراجعة لاحقاً' : '🔄 Review later',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setNotes((prev) => (prev ? `${prev}\n${tag}` : tag))}
                  className="px-3 py-1.5 text-sm bg-background-secondary hover:bg-background-tertiary rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4" />
              {isArabic ? 'حفظ الملاحظات' : 'Save Notes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyNotesModal;
