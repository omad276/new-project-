import { useState } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import type { Conversation } from '@/types';
import { ConversationItem } from './ConversationItem';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p.id !== currentUserId);
    const nameMatch = otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const propertyMatch = conv.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || propertyMatch;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const aDate = a.lastMessage?.createdAt || a.updatedAt;
    const bDate = b.lastMessage?.createdAt || b.updatedAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <div className="h-full flex flex-col bg-background border-e border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button size="sm" onClick={onNewConversation}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-secondary mb-2">No conversations yet</p>
            <p className="text-sm text-text-muted">
              Start a conversation by contacting a property agent
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {sortedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUserId}
                isActive={conversation.id === activeConversationId}
                onClick={() => onSelectConversation(conversation)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationList;
