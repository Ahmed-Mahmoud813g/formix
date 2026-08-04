import Link from 'next/link';
import { Sparkles, LayoutDashboard, PlusCircle, CreditCard, Shield } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Dashboard Top Header */}
      <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {/* Logo Link to /dashboard */}
            <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-display text-xl font-extrabold text-white">
                Form<span className="text-cyan-400">ix</span>
              </span>
            </Link>

            {/* Quick Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 border-l border-slate-800 pl-6">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <Link
                href="/forms/new"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10 transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                New AI Form
              </Link>
              <Link
                href="/billing"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Billing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-lg text-xs text-red-400/80 hover:text-red-400 border border-red-900/30 hover:bg-red-950/30 transition-all flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              Admin
            </Link>
            <span className="text-xs text-slate-500 hidden sm:inline border-l border-slate-800 pl-3">
              Formix Dashboard
            </span>
          </div>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}
