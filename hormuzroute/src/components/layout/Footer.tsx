import Link from 'next/link';
import { Ship } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Ship className="h-6 w-6 text-orange-500" />
              <span className="text-lg font-bold text-white">HormuzRoute</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-md">
              B2B maritime logistics platform for optimizing oil shipping routes
              through the Persian Gulf. Compare costs, transit times, and risk
              profiles for strategic route planning.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/calculator"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Route Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-400 text-sm">About</span>
              </li>
              <li>
                <span className="text-slate-400 text-sm">Contact</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} HormuzRoute. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
