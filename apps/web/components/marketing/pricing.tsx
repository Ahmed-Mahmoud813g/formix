'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    price: '0',
    currency: 'EGP',
    period: '/month',
    description: 'Perfect for exploring Formix and testing AI form generation.',
    highlight: false,
    badge: 'Starter',
    features: [
      'Up to 3 active forms',
      '50 responses per form',
      'Basic AI form generator',
      'Standard web link sharing',
      'Basic response table view',
      'Community support',
    ],
    buttonText: 'Get Started Free',
    variant: 'outline' as const,
  },
  {
    name: 'Pro',
    price: '80',
    currency: 'EGP',
    period: '/month',
    description: 'Best for professionals, small businesses, and content creators.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Up to 20 active forms',
      '500 responses per form',
      'Unlimited AI generations & edits',
      'Multi-language translation (Arabic, EN, FR)',
      'Custom branding & logo upload',
      'Export data (CSV, Excel, JSON)',
      'Advanced response analytics',
      'Priority email support',
    ],
    buttonText: 'Upgrade to Pro',
    variant: 'gradient' as const,
  },
  {
    name: 'Max',
    price: '150',
    currency: 'EGP',
    period: '/month',
    description: 'For growing teams, agencies, and high-volume operations.',
    highlight: false,
    badge: 'Unlimited Power',
    features: [
      'Unlimited forms & surveys',
      'Unlimited responses',
      'Advanced Gemini AI insights & summaries',
      'Remove Formix branding completely',
      'QR code & custom domain embedding',
      'PDF report generator',
      'Dedicated account manager',
    ],
    buttonText: 'Get Max Access',
    variant: 'secondary' as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-900/60 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="cyan" className="px-3.5 py-1">
            Flexible EGP Pricing
          </Badge>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Transparent Plans for Every Builder
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Start for free, upgrade when you need higher response limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.highlight
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-400/80 shadow-2xl shadow-cyan-500/10 scale-105 z-10'
                  : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge variant="cyan" className="px-3.5 py-1 shadow-lg bg-cyan-500 text-slate-950 font-bold border-none">
                    <Sparkles className="h-3 w-3 mr-1" /> {plan.badge}
                  </Badge>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-2xl font-bold text-white">{plan.name}</h3>
                  {!plan.highlight && (
                    <Badge variant="outline" className="text-xs">
                      {plan.badge}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold font-display text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm font-semibold text-cyan-400">{plan.currency}</span>
                  <span className="text-xs text-slate-500">{plan.period}</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-slate-800/80 pt-6">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link href="/register" className="w-full block">
                  <Button variant={plan.variant} className="w-full">
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
