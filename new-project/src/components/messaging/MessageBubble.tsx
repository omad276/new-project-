import { format } from 'date-fns';
import { Check, CheckCheck, Building2 } from 'lucide-react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm');
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-text-muted bg-background-secondary px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2 mb-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0">
          {message.senderAvatar ? (
            <img
              src={message.senderAvatar}
              alt={message.senderName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {message.senderName.charAt(0)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={cn('max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
        {/* Property Card Message */}
        {message.type === 'property' && message.propertyId && (
          <div
            className={cn(
              'rounded-xl overflow-hidden mb-1',
              isOwn ? 'bg-primary text-white' : 'bg-background-secondary'
            )}
          >
            {message.propertyImage && (
              <img
                src={message.propertyImage}
                alt={message.propertyTitle}
                className="w-full h-32 object-cover"
              />
            )}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4" />
                <span className="text-xs opacity-80">Property Inquiry</span>
              </div>
              <p className="font-medium text-sm">{message.propertyTitle}</p>
            </div>
          </div>
        )}

        {/* Text Content */}
        <div
          className={cn(
            'px-4 py-2 rounded-2xl',
            isOwn
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-background-secondary text-text-primary rounded-bl-md'
          )}
        >
          {message.type === 'image' ? (
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-full rounded-lg"
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Time and Read Status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 px-1',
            isOwn ? 'justify-end' : 'justify-start'
          )}
        >
          <span className="text-xs text-text-muted">{formatTime(message.createdAt)}</span>
          {isOwn && (
            message.isRead ? (
              <CheckCheck className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Check className="w-3.5 h-3.5 text-text-muted" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
