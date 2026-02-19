import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, MoreVertical, Phone, Video, ArrowLeft, Building2 } from 'lucide-react';
import { Conversation, Message } from '@/types';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  isMobile?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onBack,
  isMobile = false,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const otherParticipant = conversation?.participants.find((p) => p.id !== currentUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background-secondary/30 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center mb-4">
          <Building2 className="w-10 h-10 text-text-muted" />
        </div>
        <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
        <p className="text-sm text-text-muted max-w-md">
          Choose a conversation from the list or start a new one by contacting a property agent
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background-secondary/50">
        {isMobile && onBack && (
          <button onClick={onBack} className="p-2 -ms-2 hover:bg-background-secondary rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Avatar */}
        {otherParticipant?.avatar ? (
          <img
            src={otherParticipant.avatar}
            alt={otherParticipant.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-medium text-primary">
              {otherParticipant?.name.charAt(0) || '?'}
            </span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{otherParticipant?.name || 'Unknown'}</h3>
          {conversation.propertyTitle && (
            <p className="text-xs text-primary truncate flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {conversation.propertyTitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
            <Video className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Property Card at top if it's a property inquiry */}
        {conversation.propertyId && conversation.propertyImage && (
          <div className="mb-4 p-3 bg-background-secondary rounded-xl">
            <div className="flex items-center gap-3">
              <img
                src={conversation.propertyImage}
                alt={conversation.propertyTitle}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs text-text-muted mb-1">Inquiry about</p>
                <p className="font-medium text-sm">{conversation.propertyTitle}</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              showAvatar={showAvatar}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-end gap-2">
          <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
            <Image className="w-5 h-5 text-text-secondary" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className={cn(
                'w-full px-4 py-3 rounded-2xl bg-background-secondary',
                'border border-border focus:border-primary focus:ring-1 focus:ring-primary',
                'resize-none outline-none transition-all',
                'text-sm placeholder:text-text-muted'
              )}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="rounded-full w-11 h-11 p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
