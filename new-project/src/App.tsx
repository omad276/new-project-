import { Routes, Route } from 'react-router-dom';
import { useDirection } from './hooks/useDirection';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ToastProvider } from '@/components/ui/Toast';
import { GoogleMapsProvider } from '@/components/map';
import {
  HomePage,
  PropertiesPage,
  PropertyDetailsPage,
  LoginPage,
  RegisterPage,
  BlueprintDemoPage,
} from '@/pages/public';
import {
  DashboardOverview,
  MyPropertiesPage,
  FavoritesPage,
  ComparePage,
  NotificationsPage,
  SettingsPage,
} from '@/pages/dashboard';

// Layout wrapper for pages with Navbar and Footer
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Layout for auth pages (no navbar/footer)
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      {children}
    </div>
  );
}

function App() {
  useDirection(); // Apply RTL/LTR direction

  return (
    <GoogleMapsProvider>
      <ToastProvider>
        <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />

        {/* Public Routes with Main Layout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route
          path="/properties"
          element={
            <MainLayout>
              <PropertiesPage />
            </MainLayout>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <MainLayout>
              <PropertyDetailsPage />
            </MainLayout>
          }
        />
        <Route
          path="/blueprint"
          element={
            <MainLayout>
              <BlueprintDemoPage />
            </MainLayout>
          }
        />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <DashboardOverview />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/properties"
          element={
            <DashboardLayout>
              <MyPropertiesPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/favorites"
          element={
            <DashboardLayout>
              <FavoritesPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/compare"
          element={
            <DashboardLayout>
              <ComparePage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          }
        />

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <MainLayout>
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                  <p className="text-xl text-text-secondary mb-8">Page not found</p>
                  <a
                    href="/"
                    className="px-6 py-3 rounded-lg bg-primary text-background font-semibold hover:bg-primary-hover transition-colors"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            </MainLayout>
          }
        />
        </Routes>
      </ToastProvider>
    </GoogleMapsProvider>
  );
}

export default App;
