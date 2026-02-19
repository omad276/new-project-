import { Folder, MoreVertical, Share2, Edit2, Trash2, Lock, Globe } from 'lucide-react';
import type { Collection } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CollectionCardProps {
  collection: Collection;
  propertyCount: number;
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  isArabic?: boolean;
}

export function CollectionCard({
  collection,
  propertyCount,
  isActive,
  onClick,
  onEdit,
  onDelete,
  onShare,
  isArabic = false,
}: CollectionCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const iconMap: Record<string, React.ReactNode> = {
    folder: <Folder className="w-5 h-5" />,
    heart: <span>❤️</span>,
    star: <span>⭐</span>,
    home: <span>🏠</span>,
    building: <span>🏢</span>,
    beach: <span>🏖️</span>,
    mountain: <span>⛰️</span>,
    city: <span>🌆</span>,
  };

  return (
    <div
      className={cn(
        'relative p-4 rounded-xl border transition-all cursor-pointer',
        isActive
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50 bg-background-secondary'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${collection.color}20`, color: collection.color }}
          >
            {iconMap[collection.icon] || <Folder className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-medium">
              {isArabic && collection.nameAr ? collection.nameAr : collection.name}
            </h3>
            <p className="text-sm text-text-muted">
              {propertyCount} {isArabic ? 'عقار' : propertyCount === 1 ? 'property' : 'properties'}
            </p>
          </div>
        </div>

        {!collection.isDefault && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg hover:bg-background-tertiary transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-text-muted" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute end-0 top-full mt-1 z-20 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background-secondary transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    {isArabic ? 'مشاركة' : 'Share'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-background-secondary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    {isArabic ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isArabic ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Share indicator */}
      {collection.isShared && (
        <div className="absolute bottom-2 end-2">
          <Globe className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  );
}

export default CollectionCard;
