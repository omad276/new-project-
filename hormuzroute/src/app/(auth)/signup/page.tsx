import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { Ship } from 'lucide-react';
import { Suspense } from 'react';

export const metadata = {
  title: 'Sign Up | HormuzRoute',
  description: 'Create your HormuzRoute account and start optimizing maritime routes',
};

export default function SignupPage() {
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
              Create your account
            </h1>
            <p className="text-slate-400">
              Start optimizing your maritime logistics today
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
            <Suspense fallback={<div className="text-slate-400 text-center">Loading...</div>}>
              <SignupForm />
            </Suspense>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm mb-4">
              Trusted by logistics teams worldwide
            </p>
            <div className="flex justify-center gap-8 text-slate-600">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-xs">Routes Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">$2.4M</div>
                <div className="text-xs">Saved in Costs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">200+</div>
                <div className="text-xs">Companies</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} HormuzRoute. All rights reserved.</p>
      </footer>
    </div>
  );
}
