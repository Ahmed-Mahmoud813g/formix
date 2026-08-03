'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Wand2, CheckCircle2, FileText, Send } from 'lucide-react';
import Link from 'next/link';

const PROMPT_EXAMPLES = [
  'Create a job application form for a call center representative...',
  'Build a customer satisfaction survey with rating and feedback fields...',
  'Generate a university exam registration form in Arabic...',
  'Make a medical appointment booking form with date & time selection...',
];

export function Hero() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = PROMPT_EXAMPLES[promptIndex];
    const typingSpeed = isDeleting ? 30 : 60;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentFullText.substring(0, displayText.length + 1));
        if (displayText === currentFullText) {
          setTimeout(() => setIsDeleting(true), 2500);
        }
      } else {
        setDisplayText(currentFullText.substring(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
          setPromptIndex((prev) => (prev + 1) % PROMPT_EXAMPLES.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, promptIndex]);

  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden bg-slate-950 text-white">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <Badge variant="cyan" className="px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-cyan-400 animate-pulse" />
              Powered by Google Gemini 1.5 & GPT-4o
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.15]"
          >
            Describe Your Form in Plain English.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AI Builds It in Seconds.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed"
          >
            Stop wasting hours on manual drag-and-drop form builders. Formix uses generative AI to generate, translate, publish, and analyze complete forms instantly.
          </motion.p>

          {/* Animated Interactive Typewriter Prompt Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-2xl flex items-center gap-3">
              <div className="pl-3 text-cyan-400">
                <Wand2 className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left py-2 font-mono text-sm sm:text-base text-slate-200 min-h-[44px] flex items-center">
                <span>{displayText}</span>
                <span className="w-2 h-5 bg-cyan-400 inline-block ml-1 animate-pulse" />
              </div>
              <Link href="/register">
                <Button variant="gradient" size="default" className="gap-2 shrink-0">
                  Generate <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-xs sm:text-sm text-slate-400 pt-2"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" /> No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Free 3 forms & 50 responses
            </div>
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Full Arabic & English support
            </div>
          </motion.div>
        </div>

        {/* Live Animated Form Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:p-8 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
            {/* Mock Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 border-l border-slate-800 pl-3">
                  formix.app/f/call-center-app
                </span>
              </div>
              <Badge variant="success" className="text-[11px]">
                Live Preview
              </Badge>
            </div>

            {/* Generated Form Mockup Content */}
            <div className="space-y-6 text-left max-w-2xl mx-auto bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-2xl font-bold font-display text-white">
                  Call Center Job Application
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Please fill in your personal information and work availability.
                </p>
              </div>

              {/* Form Fields Simulation */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="h-10 rounded-xl bg-slate-900 border border-slate-800 px-3.5 flex items-center text-slate-400 text-sm">
                    Ahmed Mahmoud
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="h-10 rounded-xl bg-slate-900 border border-slate-800 px-3.5 flex items-center text-slate-400 text-sm">
                      ahmed@example.com
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="h-10 rounded-xl bg-slate-900 border border-slate-800 px-3.5 flex items-center text-slate-400 text-sm">
                      +20 100 000 0000
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Preferred Shift <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 py-2 px-3 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-medium flex items-center justify-between">
                      Morning Shift <span>✓</span>
                    </div>
                    <div className="flex-1 py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium">
                      Night Shift
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="gradient" className="w-full gap-2">
                  Submit Application <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
