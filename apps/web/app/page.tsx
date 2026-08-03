export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-slate-900 text-white">
      <div className="max-w-2xl space-y-6">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Formix AI Platform • Phase 0 Initialized
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight font-display sm:text-6xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          AI-Powered SaaS Form Builder
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed font-sans">
          Describe any form in plain natural language, generate beautiful schemas in seconds, edit with AI, collect responses, and analyze results.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium transition text-white text-sm"
          >
            FastAPI Docs ↗
          </a>
          <a
            href="http://localhost:8000/health"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium transition text-slate-300 text-sm border border-slate-700"
          >
            Backend Health ↗
          </a>
        </div>
      </div>
    </main>
  );
}
