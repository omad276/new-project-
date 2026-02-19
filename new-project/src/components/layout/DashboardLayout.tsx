import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  Heart,
  GitCompare,
  Bell,
  Settings,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  Calculator,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const isArabic = i18n.language === 'ar';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userName = user.fullName;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: t('dashboard.overview'),
    },
    {
      href: '/dashboard/properties',
      icon: Building2,
      label: t('dashboard.myProperties'),
      badge: 5,
    },
    {
      href: '/dashboard/favorites',
      icon: Heart,
      label: t('dashboard.favorites'),
      badge: 12,
    },
    {
      href: '/dashboard/compare',
      icon: GitCompare,
      label: t('dashboard.compare'),
    },
    {
      href: '/dashboard/financial-tools',
      icon: Calculator,
      label: isArabic ? 'الأدوات المالية' : 'Financial Tools',
    },
    {
      href: '/dashboard/messages',
      icon: MessageSquare,
      label: isArabic ? 'الرسائل' : 'Messages',
      badge: 2,
    },
    {
      href: '/dashboard/notifications',
      icon: Bell,
      label: t('dashboard.notifications'),
      badge: 3,
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      label: t('dashboard.settings'),
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
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

          <Link to="/" className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary">{t('common.appName')}</span>
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
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary">{t('common.appName')}</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-background-tertiary transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-background-tertiary">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} name={userName} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary truncate">{userName}</p>
              <p className="text-sm text-text-muted truncate">{user.email}</p>
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
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
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

export { DashboardLayout };
