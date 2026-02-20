import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MoreVertical,
  User,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

interface Lead {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  property: string;
  propertyAr: string;
  propertyId: string;
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'negotiating' | 'closed_won' | 'closed_lost';
  source: string;
  notes: string;
  notesAr: string;
  createdAt: string;
  createdAtAr: string;
  lastContact?: string;
  lastContactAr?: string;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الراشد',
    email: 'ahmed@email.com',
    phone: '+966 50 123 4567',
    property: 'Luxury Villa in Riyadh',
    propertyAr: 'فيلا فاخرة في الرياض',
    propertyId: '1',
    status: 'new',
    source: 'Website',
    notes: 'Interested in 5-bedroom villas',
    notesAr: 'مهتم بالفلل ذات 5 غرف نوم',
    createdAt: '2 hours ago',
    createdAtAr: 'منذ ساعتين',
  },
  {
    id: '2',
    name: 'Sara Mohammed',
    nameAr: 'سارة محمد',
    email: 'sara@email.com',
    phone: '+966 55 987 6543',
    property: 'Modern Apartment in Jeddah',
    propertyAr: 'شقة حديثة في جدة',
    propertyId: '2',
    status: 'contacted',
    source: 'Referral',
    notes: 'Looking for sea view',
    notesAr: 'تبحث عن إطلالة بحرية',
    createdAt: '5 hours ago',
    createdAtAr: 'منذ 5 ساعات',
    lastContact: '1 hour ago',
    lastContactAr: 'منذ ساعة',
  },
  {
    id: '3',
    name: 'Mohammed Ali',
    nameAr: 'محمد علي',
    email: 'mohammed@email.com',
    phone: '+966 54 456 7890',
    property: 'Office Space Downtown',
    propertyAr: 'مكتب في وسط المدينة',
    propertyId: '3',
    status: 'viewing_scheduled',
    source: 'Website',
    notes: 'Viewing scheduled for Saturday',
    notesAr: 'تم جدولة المعاينة ليوم السبت',
    createdAt: '1 day ago',
    createdAtAr: 'منذ يوم',
    lastContact: '3 hours ago',
    lastContactAr: 'منذ 3 ساعات',
  },
  {
    id: '4',
    name: 'Khalid Hassan',
    nameAr: 'خالد حسن',
    email: 'khalid@email.com',
    phone: '+966 56 789 0123',
    property: 'Commercial Land',
    propertyAr: 'أرض تجارية',
    propertyId: '4',
    status: 'negotiating',
    source: 'Social Media',
    notes: 'Negotiating price, budget is 4.5M',
    notesAr: 'التفاوض على السعر، الميزانية 4.5 مليون',
    createdAt: '3 days ago',
    createdAtAr: 'منذ 3 أيام',
    lastContact: 'Yesterday',
    lastContactAr: 'أمس',
  },
  {
    id: '5',
    name: 'Fatima Al-Saud',
    nameAr: 'فاطمة آل سعود',
    email: 'fatima@email.com',
    phone: '+966 50 234 5678',
    property: 'Luxury Villa in Riyadh',
    propertyAr: 'فيلا فاخرة في الرياض',
    propertyId: '1',
    status: 'closed_won',
    source: 'Website',
    notes: 'Deal closed successfully',
    notesAr: 'تم إتمام الصفقة بنجاح',
    createdAt: '1 week ago',
    createdAtAr: 'منذ أسبوع',
    lastContact: '2 days ago',
    lastContactAr: 'منذ يومين',
  },
];

function LeadsPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.nameAr.includes(searchQuery) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.property.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return { variant: 'primary' as const, label: isArabic ? 'جديد' : 'New' };
      case 'contacted':
        return { variant: 'warning' as const, label: isArabic ? 'تم التواصل' : 'Contacted' };
      case 'viewing_scheduled':
        return { variant: 'success' as const, label: isArabic ? 'معاينة مجدولة' : 'Viewing Scheduled' };
      case 'negotiating':
        return { variant: 'primary' as const, label: isArabic ? 'تفاوض' : 'Negotiating' };
      case 'closed_won':
        return { variant: 'success' as const, label: isArabic ? 'تم الإغلاق' : 'Closed Won' };
      case 'closed_lost':
        return { variant: 'error' as const, label: isArabic ? 'خسارة' : 'Closed Lost' };
      default:
        return { variant: 'secondary' as const, label: status };
    }
  };

  const statuses = [
    { value: '', label: isArabic ? 'جميع الحالات' : 'All Statuses' },
    { value: 'new', label: isArabic ? 'جديد' : 'New' },
    { value: 'contacted', label: isArabic ? 'تم التواصل' : 'Contacted' },
    { value: 'viewing_scheduled', label: isArabic ? 'معاينة مجدولة' : 'Viewing Scheduled' },
    { value: 'negotiating', label: isArabic ? 'تفاوض' : 'Negotiating' },
    { value: 'closed_won', label: isArabic ? 'تم الإغلاق' : 'Closed Won' },
    { value: 'closed_lost', label: isArabic ? 'خسارة' : 'Closed Lost' },
  ];

  const leadStats = {
    total: mockLeads.length,
    new: mockLeads.filter((l) => l.status === 'new').length,
    active: mockLeads.filter((l) => ['contacted', 'viewing_scheduled', 'negotiating'].includes(l.status)).length,
    closed: mockLeads.filter((l) => l.status === 'closed_won').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          {isArabic ? 'العملاء المحتملين' : 'Leads'}
        </h1>
        <p className="text-text-secondary mt-2">
          {isArabic
            ? 'إدارة العملاء المحتملين والاستفسارات'
            : 'Manage your leads and inquiries'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-text-secondary text-sm">
              {isArabic ? 'إجمالي العملاء' : 'Total Leads'}
            </p>
            <p className="text-2xl font-bold text-text-primary">{leadStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-text-secondary text-sm">
              {isArabic ? 'جدد' : 'New'}
            </p>
            <p className="text-2xl font-bold text-primary">{leadStats.new}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-text-secondary text-sm">
              {isArabic ? 'نشطين' : 'Active'}
            </p>
            <p className="text-2xl font-bold text-yellow-500">{leadStats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-text-secondary text-sm">
              {isArabic ? 'تم الإغلاق' : 'Closed Won'}
            </p>
            <p className="text-2xl font-bold text-green-500">{leadStats.closed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                type="text"
                placeholder={isArabic ? 'البحث عن عميل...' : 'Search leads...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'قائمة العملاء' : 'Lead List'} ({filteredLeads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">
                  {isArabic ? 'لا يوجد عملاء' : 'No leads found'}
                </p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const status = getStatusBadge(lead.status);
                return (
                  <div
                    key={lead.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-background-tertiary hover:border-primary/50 transition-colors"
                  >
                    <Avatar name={isArabic ? lead.nameAr : lead.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-text-primary">
                          {isArabic ? lead.nameAr : lead.name}
                        </p>
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                        <Building2 className="w-4 h-4" />
                        {isArabic ? lead.propertyAr : lead.property}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {isArabic ? lead.createdAtAr : lead.createdAt}
                        </span>
                      </div>
                      {lead.notes && (
                        <p className="text-sm text-text-secondary mt-2 italic">
                          "{isArabic ? lead.notesAr : lead.notes}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" title={isArabic ? 'اتصال' : 'Call'}>
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title={isArabic ? 'رسالة' : 'Message'}>
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title={isArabic ? 'جدولة' : 'Schedule'}>
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setOpenDropdown(openDropdown === lead.id ? null : lead.id)
                          }
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        {openDropdown === lead.id && (
                          <div className="absolute end-0 top-full mt-1 w-48 bg-background-secondary border border-background-tertiary rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => {
                                setSelectedLead(lead);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-start text-text-primary hover:bg-background-tertiary"
                            >
                              <User className="w-4 h-4" />
                              {isArabic ? 'عرض التفاصيل' : 'View Details'}
                            </button>
                            <button
                              onClick={() => setOpenDropdown(null)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-start text-green-500 hover:bg-background-tertiary"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {isArabic ? 'إغلاق كفوز' : 'Close as Won'}
                            </button>
                            <button
                              onClick={() => setOpenDropdown(null)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-start text-error hover:bg-background-tertiary"
                            >
                              <XCircle className="w-4 h-4" />
                              {isArabic ? 'إغلاق كخسارة' : 'Close as Lost'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedLead(null)}
          />
          <div className="relative bg-background-secondary rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              {isArabic ? 'تفاصيل العميل' : 'Lead Details'}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar name={isArabic ? selectedLead.nameAr : selectedLead.name} size="lg" />
                <div>
                  <p className="font-semibold text-text-primary">
                    {isArabic ? selectedLead.nameAr : selectedLead.name}
                  </p>
                  <Badge variant={getStatusBadge(selectedLead.status).variant} size="sm">
                    {getStatusBadge(selectedLead.status).label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-background-tertiary">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <span className="text-text-primary">{selectedLead.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-text-muted" />
                  <span className="text-text-primary">{selectedLead.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-text-muted" />
                  <span className="text-text-primary">
                    {isArabic ? selectedLead.propertyAr : selectedLead.property}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-background-tertiary">
                <p className="text-sm text-text-secondary mb-2">
                  {isArabic ? 'ملاحظات' : 'Notes'}
                </p>
                <p className="text-text-primary">
                  {isArabic ? selectedLead.notesAr : selectedLead.notes}
                </p>
              </div>

              <div className="pt-4 border-t border-background-tertiary">
                <p className="text-sm text-text-secondary">
                  {isArabic ? 'المصدر' : 'Source'}: {selectedLead.source}
                </p>
                <p className="text-sm text-text-secondary">
                  {isArabic ? 'تاريخ الإنشاء' : 'Created'}:{' '}
                  {isArabic ? selectedLead.createdAtAr : selectedLead.createdAt}
                </p>
                {selectedLead.lastContact && (
                  <p className="text-sm text-text-secondary">
                    {isArabic ? 'آخر تواصل' : 'Last Contact'}:{' '}
                    {isArabic ? selectedLead.lastContactAr : selectedLead.lastContact}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setSelectedLead(null)}>
                {isArabic ? 'إغلاق' : 'Close'}
              </Button>
              <Button variant="primary">
                <MessageSquare className="w-4 h-4 me-2" />
                {isArabic ? 'إرسال رسالة' : 'Send Message'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { LeadsPage };
