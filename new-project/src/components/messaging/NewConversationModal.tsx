import { useState } from 'react';
import { X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
  contacts: Contact[];
}

export function NewConversationModal({
  isOpen,
  onClose,
  onSelectContact,
  contacts,
}: NewConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedContacts = filteredContacts.reduce(
    (acc, contact) => {
      const role = contact.role;
      if (!acc[role]) acc[role] = [];
      acc[role].push(contact);
      return acc;
    },
    {} as Record<string, Contact[]>
  );

  const roleLabels: Record<string, string> = {
    agent: 'Agents',
    owner: 'Property Owners',
    buyer: 'Buyers',
    admin: 'Administrators',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">New Conversation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
              autoFocus
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="w-12 h-12 text-text-muted mb-3" />
              <p className="text-text-secondary">No contacts found</p>
            </div>
          ) : (
            Object.entries(groupedContacts).map(([role, roleContacts]) => (
              <div key={role} className="mb-4">
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2">
                  {roleLabels[role] || role}
                </h3>
                <div className="space-y-1">
                  {roleContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        onSelectContact(contact);
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl',
                        'hover:bg-background-secondary transition-colors text-start'
                      )}
                    >
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-lg font-medium text-primary">
                            {contact.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs text-text-muted capitalize">{contact.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NewConversationModal;
