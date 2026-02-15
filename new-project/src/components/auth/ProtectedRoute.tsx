import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole, RolePermissions } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  // Optional: require specific roles
  allowedRoles?: UserRole[];
  // Optional: require specific permission
  requiredPermission?: keyof RolePermissions;
  // Redirect path when not authenticated
  redirectTo?: string;
}

function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermission,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission, isRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!isRole(...allowedRoles)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-error mb-4">403</h1>
            <p className="text-text-secondary mb-4">
              You don't have permission to access this page.
            </p>
            <a
              href="/dashboard"
              className="text-primary hover:underline"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  // Check permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-error mb-4">403</h1>
          <p className="text-text-secondary mb-4">
            You don't have permission to access this page.
          </p>
          <a
            href="/dashboard"
            className="text-primary hover:underline"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Admin only route
function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

// Owner or above route (owner, agent, admin)
function OwnerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['owner', 'agent', 'admin']}>
      {children}
    </ProtectedRoute>
  );
}

// Guest only route (redirect if authenticated)
function GuestRoute({
  children,
  redirectTo = '/dashboard',
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

export { ProtectedRoute, AdminRoute, OwnerRoute, GuestRoute };
