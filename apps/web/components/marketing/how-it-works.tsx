'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { MessageSquarePlus, Wand2, Share2, BarChart3, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Describe Your Goal',
    description: 'Type a brief description of the form you need in plain English or Arabic. Mention your industry, targeted audience, or required fields.',
    icon: MessageSquarePlus,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    step: '02',
    title: 'AI Generates & Fine-Tunes',
    description: 'Our Google Gemini 1.5 engine instantly structures logical sections, inputs, validations, and themes. Refine any section with quick natural prompts.',
    icon: Wand2,
    color: 'from-cyan-400 to-blue-500',
  },
  {
    step: '03',
    title: 'Publish & Collect Insights',
    description: 'Get a clean public share link, QR code, or iframe embed code. Watch responses roll in with real-time completion analytics and CSV export.',
    icon: Share2,
    color: 'from-emerald-400 to-cyan-500',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="cyan" className="px-3.5 py-1">
            Simple 3-Step Workflow
          </Badge>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
            How Formix Works
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            From prompt idea to published form in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group relative rounded-3xl border border-slate-800 bg-slate-900/50 p-8 hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${s.color} p-0.5 shadow-lg`}>
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                        <Icon className="h-6 w-6 text-cyan-400" />
                      </div>
                    </div>
                    <span className="font-mono text-4xl font-extrabold text-slate-800 group-hover:text-slate-700 transition-colors">
                      {s.step}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  Learn more <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
