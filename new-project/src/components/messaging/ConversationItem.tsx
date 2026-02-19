import { format, isToday, isYesterday } from 'date-fns';
import { Building2 } from 'lucide-react';
import type { Conversation } from '@/types';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onClick,
}: ConversationItemProps) {
  const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    if (isToday(d)) {
      return format(d, 'HH:mm');
    }
    if (isYesterday(d)) {
      return 'Yesterday';
    }
    return format(d, 'dd/MM/yy');
  };

  const truncateMessage = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 flex items-start gap-3 text-start transition-colors hover:bg-background-secondary/50',
        isActive && 'bg-background-secondary'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {otherParticipant?.avatar ? (
          <img
            src={otherParticipant.avatar}
            alt={otherParticipant.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-medium text-primary">
              {otherParticipant?.name.charAt(0) || '?'}
            </span>
          </div>
        )}
        {/* Online indicator (mock) */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium truncate">{otherParticipant?.name || 'Unknown'}</h4>
          {conversation.lastMessage && (
            <span className="text-xs text-text-muted">
              {formatDate(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>

        {/* Property Badge */}
        {conversation.propertyTitle && (
          <div className="flex items-center gap-1 mb-1">
            <Building2 className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary truncate">{conversation.propertyTitle}</span>
          </div>
        )}

        {/* Last Message */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary truncate">
            {conversation.lastMessage
              ? truncateMessage(conversation.lastMessage.content)
              : 'No messages yet'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ConversationItem;
