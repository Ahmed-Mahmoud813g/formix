import Link from 'next/link';
import { Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950 text-white">
      {/* Left Form Area */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative z-10">
        <div>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-display text-2xl font-extrabold text-white">
                Form<span className="text-cyan-400">ix</span>
              </span>
            </Link>

            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          </div>
        </div>

        <div className="my-auto py-8 max-w-md w-full mx-auto">{children}</div>

        <div className="text-xs text-slate-500 text-center sm:text-left">
          © 2026 Formix AI. All rights reserved.
        </div>
      </div>

      {/* Right Visual Showcase Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 border-l border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Generative AI SaaS Builder
          </div>
          <h2 className="font-display text-4xl font-extrabold text-white leading-tight">
            Build, Edit, and Analyze Forms 10x Faster with AI.
          </h2>
        </div>

        <div className="relative z-10 space-y-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-slate-950 text-sm">
              AK
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Ahmed Mahmoud Khalil</div>
              <div className="text-xs text-slate-400">AI / ML Engineer & Creator</div>
            </div>
          </div>
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "Formix eliminated manual drag-and-drop building completely. Describe your schema, let Gemini 1.5 handle logic, and collect real-time data seamlessly."
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Free Tier Available
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" /> English & Arabic AI
          </span>
        </div>
      </div>
    </div>
  );
}
