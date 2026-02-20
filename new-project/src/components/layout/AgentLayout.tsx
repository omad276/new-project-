import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  Briefcase,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';

interface AgentLayoutProps {
  children: React.ReactNode;
}

function AgentLayout({ children }: AgentLayoutProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const isArabic = i18n.language === 'ar';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect non-agent users to dashboard (allow admin access too)
  if (user.role !== 'agent' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const userName = user.fullName;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    {
      href: '/agent',
      icon: LayoutDashboard,
      label: isArabic ? 'لوحة التحكم' : 'Dashboard',
    },
    {
      href: '/agent/listings',
      icon: Building2,
      label: isArabic ? 'قوائمي' : 'My Listings',
      badge: 12,
    },
    {
      href: '/agent/leads',
      icon: Users,
      label: isArabic ? 'العملاء المحتملين' : 'Leads',
      badge: 5,
    },
    {
      href: '/agent/appointments',
      icon: Calendar,
      label: isArabic ? 'المواعيد' : 'Appointments',
    },
    {
      href: '/agent/messages',
      icon: MessageSquare,
      label: isArabic ? 'الرسائل' : 'Messages',
      badge: 3,
    },
    {
      href: '/agent/performance',
      icon: BarChart3,
      label: isArabic ? 'الأداء' : 'Performance',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/agent') {
      return location.pathname === '/agent';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-background-secondary border-b border-background-tertiary">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/agent" className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary">
              {isArabic ? 'لوحة الوكيل' : 'Agent Portal'}
            </span>
          </Link>

          <Avatar src={user.avatar} name={userName} size="sm" />
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 start-0 z-50 h-full w-72 bg-background-secondary border-e border-background-tertiary',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-background-tertiary">
          <Link to="/agent" className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary">
              {isArabic ? 'الوكيل' : 'Agent'}
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-background-tertiary transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agent Badge */}
        <div className="p-4 border-b border-background-tertiary">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} name={userName} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary truncate">{userName}</p>
              <Badge variant="success" size="sm">
                {isArabic ? 'وكيل عقاري' : 'Real Estate Agent'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive(item.href)
                  ? 'bg-primary text-background'
                  : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge
                  variant={isActive(item.href) ? 'default' : 'primary'}
                  size="sm"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 start-0 end-0 p-4 border-t border-background-tertiary">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            <span>{isArabic ? 'لوحة المستخدم' : 'User Dashboard'}</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors"
          >
            <Building2 className="w-5 h-5" />
            <span>{isArabic ? 'العودة للموقع' : 'Back to Site'}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-error hover:bg-error/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ms-72 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export { AgentLayout };
