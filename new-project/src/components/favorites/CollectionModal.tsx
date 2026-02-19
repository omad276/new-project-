import { useState, useEffect } from 'react';
import { X, Folder } from 'lucide-react';
import { Collection } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: Partial<Collection>) => void;
  collection?: Collection | null;
  isArabic?: boolean;
}

const COLORS = [
  '#C5A572', // Gold
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
];

const ICONS = [
  { id: 'folder', label: '📁' },
  { id: 'heart', label: '❤️' },
  { id: 'star', label: '⭐' },
  { id: 'home', label: '🏠' },
  { id: 'building', label: '🏢' },
  { id: 'beach', label: '🏖️' },
  { id: 'mountain', label: '⛰️' },
  { id: 'city', label: '🌆' },
];

export function CollectionModal({
  isOpen,
  onClose,
  onSave,
  collection,
  isArabic = false,
}: CollectionModalProps) {
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState('folder');

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setNameAr(collection.nameAr || '');
      setDescription(collection.description || '');
      setColor(collection.color);
      setIcon(collection.icon);
    } else {
      setName('');
      setNameAr('');
      setDescription('');
      setColor(COLORS[0]);
      setIcon('folder');
    }
  }, [collection, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: collection?.id,
      name,
      nameAr: nameAr || undefined,
      description: description || undefined,
      color,
      icon,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {collection
              ? isArabic
                ? 'تعديل المجموعة'
                : 'Edit Collection'
              : isArabic
                ? 'مجموعة جديدة'
                : 'New Collection'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {ICONS.find((i) => i.id === icon)?.label || '📁'}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {isArabic ? 'اسم المجموعة (إنجليزي)' : 'Collection Name'}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isArabic ? 'مثال: عقارات للاستثمار' : 'e.g., Investment Properties'}
              required
            />
          </div>

          {/* Arabic Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {isArabic ? 'اسم المجموعة (عربي)' : 'Arabic Name (Optional)'}
            </label>
            <Input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder={isArabic ? 'الاسم بالعربي' : 'Name in Arabic'}
              dir="rtl"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {isArabic ? 'الوصف (اختياري)' : 'Description (Optional)'}
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isArabic ? 'وصف المجموعة' : 'Describe this collection'}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {isArabic ? 'اللون' : 'Color'}
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-transform',
                    color === c && 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {isArabic ? 'الأيقونة' : 'Icon'}
            </label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setIcon(i.id)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors',
                    icon === i.id
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'bg-background-secondary hover:bg-background-tertiary'
                  )}
                >
                  {i.label}
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
              {collection
                ? isArabic
                  ? 'حفظ التغييرات'
                  : 'Save Changes'
                : isArabic
                  ? 'إنشاء المجموعة'
                  : 'Create Collection'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CollectionModal;
