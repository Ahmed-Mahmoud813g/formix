import { Sparkles } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Minimal dashboard header for Phase 3 — full sidebar built in Phase 4 */}
      <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <span className="font-display text-xl font-extrabold text-white">
              Form<span className="text-cyan-400">ix</span>
            </span>
          </div>
          <span className="text-xs text-slate-500">Dashboard</span>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
