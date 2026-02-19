import { useState } from 'react';
import { X, Link2, Copy, Check, Globe, Lock, Mail, MessageSquare } from 'lucide-react';
import { Collection } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface ShareCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleShare: (collectionId: string, isShared: boolean) => void;
  collection: Collection | null;
  isArabic?: boolean;
}

export function ShareCollectionModal({
  isOpen,
  onClose,
  onToggleShare,
  collection,
  isArabic = false,
}: ShareCollectionModalProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  if (!isOpen || !collection) return null;

  const shareLink = collection.shareLink || `https://upgreat.sa/shared/${collection.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleShare = () => {
    onToggleShare(collection.id, !collection.isShared);
  };

  const handleShareVia = (platform: string) => {
    const text = isArabic
      ? `شاهد مجموعة العقارات: ${collection.name}`
      : `Check out my property collection: ${collection.name}`;
    const url = shareLink;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {isArabic ? 'مشاركة المجموعة' : 'Share Collection'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Collection Info */}
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2"
              style={{ backgroundColor: `${collection.color}20`, color: collection.color }}
            >
              {collection.icon === 'folder' ? '📁' : collection.icon === 'heart' ? '❤️' : '📁'}
            </div>
            <h3 className="font-medium">
              {isArabic && collection.nameAr ? collection.nameAr : collection.name}
            </h3>
            <p className="text-sm text-text-muted">
              {collection.propertyIds.length}{' '}
              {isArabic ? 'عقار' : collection.propertyIds.length === 1 ? 'property' : 'properties'}
            </p>
          </div>

          {/* Share Toggle */}
          <div className="p-4 rounded-xl bg-background-secondary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {collection.isShared ? (
                  <Globe className="w-5 h-5 text-primary" />
                ) : (
                  <Lock className="w-5 h-5 text-text-muted" />
                )}
                <div>
                  <p className="font-medium">
                    {collection.isShared
                      ? isArabic
                        ? 'المجموعة عامة'
                        : 'Collection is Public'
                      : isArabic
                        ? 'المجموعة خاصة'
                        : 'Collection is Private'}
                  </p>
                  <p className="text-sm text-text-muted">
                    {collection.isShared
                      ? isArabic
                        ? 'أي شخص لديه الرابط يمكنه المشاهدة'
                        : 'Anyone with the link can view'
                      : isArabic
                        ? 'فقط أنت يمكنك المشاهدة'
                        : 'Only you can view'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleShare}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  collection.isShared ? 'bg-primary' : 'bg-background-tertiary'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    collection.isShared ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Share Link */}
          {collection.isShared && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isArabic ? 'رابط المشاركة' : 'Share Link'}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-background-secondary"
                  />
                  <Button onClick={handleCopyLink} variant="outline">
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Share via */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isArabic ? 'مشاركة عبر' : 'Share via'}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleShareVia('whatsapp')}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleShareVia('email')}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                </div>
              </div>

              {/* Invite by Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isArabic ? 'دعوة بالبريد الإلكتروني' : 'Invite by Email'}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isArabic ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                    className="flex-1"
                  />
                  <Button onClick={() => handleShareVia('email')} disabled={!email}>
                    {isArabic ? 'إرسال' : 'Send'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full">
            {isArabic ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ShareCollectionModal;
