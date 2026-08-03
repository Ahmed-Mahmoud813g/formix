'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Globe2,
  Move,
  QrCode,
  BarChart3,
  Download,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    title: 'Natural Language AI Generation',
    description: 'Specify your exact requirements or let Gemini 1.5 craft relevant questions, input types, and field validation logic automatically.',
    icon: Sparkles,
    badge: 'AI Powered',
  },
  {
    title: 'Multi-Lingual & Arabic Support',
    description: 'Instantly translate any form between English, Arabic, French, Spanish, and German with right-to-left (RTL) layout optimization.',
    icon: Globe2,
    badge: 'Bilingual',
  },
  {
    title: 'Visual Builder & Drag-and-Drop',
    description: 'Reorder sections, add customized inputs, adjust validation rules, and fine-tune themes effortlessly.',
    icon: Move,
    badge: 'Drag & Drop',
  },
  {
    title: 'One-Click Publish & QR Codes',
    description: 'Share public links instantly, embed responsive forms into websites, or download high-resolution QR codes for print media.',
    icon: QrCode,
    badge: 'Instant Share',
  },
  {
    title: 'Real-Time Response Analytics',
    description: 'Track form views, completion rates, submission trends, device distribution, and geographical breakdown in real-time.',
    icon: BarChart3,
    badge: 'Analytics',
  },
  {
    title: 'Multi-Format Export',
    description: 'Export response datasets seamlessly to CSV, Microsoft Excel, JSON, or PDF formats for downstream workflow integration.',
    icon: Download,
    badge: 'Data Export',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-900/60 relative border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="default" className="px-3.5 py-1">
            <Zap className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
            Enterprise-Grade Features
          </Badge>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Everything You Need to Build High-Converting Forms
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Designed for speed, beauty, and actionable intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
