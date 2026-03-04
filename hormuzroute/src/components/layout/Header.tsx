'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ship, LogOut, LayoutDashboard, Loader2, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, loading, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Ship className="h-8 w-8 text-orange-500" />
          <span className="text-xl font-bold text-white">HormuzRoute</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/app"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Calculator
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-24 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
            </div>
          ) : user ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <User className="h-4 w-4" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                disabled={signingOut}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {signingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-md bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/app"
              className="block text-sm font-medium text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Calculator
            </Link>
            <Link
              href="/pricing"
              className="block text-sm font-medium text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-500 mb-2">{user.email}</p>
                  <Button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    {signingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-2" />
                    )}
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <Link
                  href="/login"
                  className="block text-center py-2 text-sm font-medium text-slate-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block text-center py-2 rounded-md bg-orange-500 text-sm font-medium text-white hover:bg-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
