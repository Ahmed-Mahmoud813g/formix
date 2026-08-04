import Link from 'next/link';
import { Sparkles, Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5">
            <div className="h-full w-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
          <span className="font-display text-xl font-bold text-white">
            Form<span className="text-cyan-400">ix</span>
          </span>
          <span className="text-xs text-slate-500 border-l border-slate-800 pl-3">
            AI-Powered Form Builder SaaS
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || 'https://formix-production.up.railway.app'}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            API Docs
          </a>
        </div>

        {/* Social & Owner Info */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>© 2026 Formix. Created by Ahmed Mahmoud Khalil.</span>
          <a
            href="https://github.com/Ahmed-Mahmoud813g"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
