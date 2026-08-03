import { Sparkles, Shield } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-red-900/30 bg-red-950/20 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-red-600 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl font-extrabold text-white">
              Form<span className="text-red-400">ix</span> <span className="text-xs text-red-400 font-normal">Admin</span>
            </span>
          </div>
          <span className="text-xs text-red-400/70 border border-red-900/40 px-2 py-1 rounded-lg">
            🔒 Admin Access
          </span>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
