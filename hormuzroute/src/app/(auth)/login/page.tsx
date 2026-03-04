import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Ship } from 'lucide-react';
import { Suspense } from 'react';

export const metadata = {
  title: 'Sign In | HormuzRoute',
  description: 'Sign in to your HormuzRoute account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Ship className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-white">HormuzRoute</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-slate-400">
              Sign in to access your maritime route intelligence
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
            <Suspense fallback={<div className="text-slate-400 text-center">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} HormuzRoute. All rights reserved.</p>
      </footer>
    </div>
  );
}
