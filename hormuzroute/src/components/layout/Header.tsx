'use client';

import Link from 'next/link';
import { Ship } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Ship className="h-8 w-8 text-orange-500" />
          <span className="text-xl font-bold text-white">HormuzRoute</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/calculator"
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
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/calculator"
            className="inline-flex h-9 items-center justify-center rounded-md bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
