import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConversationList, ChatWindow, NewConversationModal } from '@/components/messaging';
import type { Conversation, Message } from '@/types';
import { cn } from '@/lib/utils';

// Mock current user
const CURRENT_USER_ID = 'user-1';

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      { id: 'user-1', name: 'You', role: 'buyer' },
      { id: 'agent-1', name: 'Ahmed Al-Rashid', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', role: 'agent' },
    ],
    propertyId: 'prop-1',
    propertyTitle: 'Luxury Villa in Al-Olaya',
    propertyImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200',
    lastMessage: {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'agent-1',
      senderName: 'Ahmed Al-Rashid',
      type: 'text',
      content: 'Yes, the property is still available. Would you like to schedule a viewing?',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
    unreadCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'conv-2',
    participants: [
      { id: 'user-1', name: 'You', role: 'buyer' },
      { id: 'agent-2', name: 'Sara Mohammed', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', role: 'agent' },
    ],
    propertyId: 'prop-2',
    propertyTitle: 'Modern Apartment in King Abdullah District',
    propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200',
    lastMessage: {
      id: 'msg-2',
      conversationId: 'conv-2',
      senderId: 'user-1',
      senderName: 'You',
      type: 'text',
      content: 'Thank you for the information. I will get back to you soon.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'conv-3',
    participants: [
      { id: 'user-1', name: 'You', role: 'buyer' },
      { id: 'owner-1', name: 'Khalid Ibrahim', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', role: 'owner' },
    ],
    lastMessage: {
      id: 'msg-3',
      conversationId: 'conv-3',
      senderId: 'owner-1',
      senderName: 'Khalid Ibrahim',
      type: 'text',
      content: 'Hello! I saw your inquiry about investment properties.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
];

// Mock messages for each conversation
const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderName: 'You',
      type: 'property',
      content: 'Hi, I am interested in this property. Is it still available?',
      propertyId: 'prop-1',
      propertyTitle: 'Luxury Villa in Al-Olaya',
      propertyImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      senderId: 'agent-1',
      senderName: 'Ahmed Al-Rashid',
      senderAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      type: 'text',
      content: 'Hello! Thank you for your interest in this beautiful villa.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      senderId: 'agent-1',
      senderName: 'Ahmed Al-Rashid',
      senderAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      type: 'text',
      content: 'Yes, the property is still available. Would you like to schedule a viewing?',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      senderId: 'user-1',
      senderName: 'You',
      type: 'property',
      content: 'I would like more information about this apartment.',
      propertyId: 'prop-2',
      propertyTitle: 'Modern Apartment in King Abdullah District',
      propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      senderId: 'agent-2',
      senderName: 'Sara Mohammed',
      senderAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      type: 'text',
      content: 'Of course! This apartment has 3 bedrooms, modern finishes, and a great view. The price is negotiable.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      senderId: 'agent-2',
      senderName: 'Sara Mohammed',
      senderAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      type: 'text',
      content: 'The building also has a gym, swimming pool, and 24/7 security.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11),
    },
    {
      id: 'msg-2-4',
      conversationId: 'conv-2',
      senderId: 'user-1',
      senderName: 'You',
      type: 'text',
      content: 'Thank you for the information. I will get back to you soon.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-3',
      senderId: 'owner-1',
      senderName: 'Khalid Ibrahim',
      senderAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      type: 'text',
      content: 'Hello! I saw your inquiry about investment properties.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  ],
};

// Mock contacts
const mockContacts = [
  { id: 'agent-1', name: 'Ahmed Al-Rashid', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', role: 'agent' },
  { id: 'agent-2', name: 'Sara Mohammed', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', role: 'agent' },
  { id: 'agent-3', name: 'Mohammed Ali', avatar: 'https://randomuser.me/api/portraits/men/4.jpg', role: 'agent' },
  { id: 'owner-1', name: 'Khalid Ibrahim', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', role: 'owner' },
  { id: 'owner-2', name: 'Fatima Hassan', avatar: 'https://randomuser.me/api/portraits/women/5.jpg', role: 'owner' },
];

export function MessagesPage() {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);

  // Handle URL params for direct conversation opening
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        setActiveConversation(conv);
        setMessages(mockMessages[conv.id] || []);
        setIsMobileViewingChat(true);
      }
    }
  }, [searchParams, conversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setMessages(mockMessages[conversation.id] || []);
    setIsMobileViewingChat(true);

    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = (content: string) => {
    if (!activeConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: CURRENT_USER_ID,
      senderName: 'You',
      type: 'text',
      content,
      isRead: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Update conversation's last message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, lastMessage: newMessage, updatedAt: new Date() }
          : c
      )
    );

    // Simulate reply after 2 seconds
    setTimeout(() => {
      const otherParticipant = activeConversation.participants.find(
        (p) => p.id !== CURRENT_USER_ID
      );
      if (otherParticipant) {
        const replyMessage: Message = {
          id: `msg-${Date.now()}-reply`,
          conversationId: activeConversation.id,
          senderId: otherParticipant.id,
          senderName: otherParticipant.name,
          senderAvatar: otherParticipant.avatar,
          type: 'text',
          content: 'Thank you for your message. I will get back to you shortly!',
          isRead: true,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, replyMessage]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? { ...c, lastMessage: replyMessage, updatedAt: new Date() }
              : c
          )
        );
      }
    }, 2000);
  };

  const handleNewConversation = (contact: { id: string; name: string; avatar?: string; role: string }) => {
    // Check if conversation already exists
    const existingConv = conversations.find((c) =>
      c.participants.some((p) => p.id === contact.id)
    );

    if (existingConv) {
      handleSelectConversation(existingConv);
      return;
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [
        { id: CURRENT_USER_ID, name: 'You', role: 'buyer' },
        { id: contact.id, name: contact.name, avatar: contact.avatar, role: contact.role as 'buyer' | 'owner' | 'agent' | 'admin' },
      ],
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    mockMessages[newConversation.id] = [];
    handleSelectConversation(newConversation);
  };

  const handleBack = () => {
    setIsMobileViewingChat(false);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-background rounded-xl overflow-hidden border border-border">
      {/* Conversation List - Hidden on mobile when viewing chat */}
      <div
        className={cn(
          'w-full md:w-80 lg:w-96 flex-shrink-0',
          isMobileViewingChat && 'hidden md:block'
        )}
      >
        <ConversationList
          conversations={conversations}
          currentUserId={CURRENT_USER_ID}
          activeConversationId={activeConversation?.id}
          onSelectConversation={handleSelectConversation}
          onNewConversation={() => setShowNewConversation(true)}
        />
      </div>

      {/* Chat Window */}
      <div
        className={cn(
          'flex-1 border-s border-border',
          !isMobileViewingChat && 'hidden md:block'
        )}
      >
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          currentUserId={CURRENT_USER_ID}
          onSendMessage={handleSendMessage}
          onBack={handleBack}
          isMobile={isMobileViewingChat}
        />
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onSelectContact={handleNewConversation}
        contacts={mockContacts}
      />
    </div>
  );
}

export default MessagesPage;
