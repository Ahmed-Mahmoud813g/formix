'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard, Zap, Infinity, CheckCircle2, Upload, X,
  AlertCircle, Crown, ArrowRight, Loader2, Clock
} from 'lucide-react';

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, color: 'slate',
    features: ['3 forms', '50 responses / form', 'Basic analytics', '5 AI generations / month'],
  },
  {
    id: 'pro', name: 'Pro', price: 80, color: 'blue', popular: true,
    features: ['20 forms', '500 responses / form', 'Advanced analytics', 'CSV & Excel export', '100 AI generations / month'],
  },
  {
    id: 'max', name: 'Max', price: 150, color: 'purple',
    features: ['Unlimited forms', 'Unlimited responses', 'AI insights', 'Team collaboration', 'Priority support'],
  },
];

export default function BillingPage() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [screenshot, setScreenshot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { loadPlan(); }, []);

  const loadPlan = async () => {
    try {
      const res = await api.get('/billing/plan');
      setPlan(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    const res = await api.get(`/billing/payment-info?plan=${planId}`);
    setPaymentInfo(res.data);
    setShowPayment(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      await api.post('/billing/upgrade', { plan: selectedPlan, payment_screenshot: screenshot || null });
      setSubmitted(true);
      setShowPayment(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
    </div>
  );

  const usagePct = (used: number, limit: number) =>
    limit === -1 ? 0 : Math.min(Math.round((used / limit) * 100), 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">Billing & Plan</h1>
        <p className="text-slate-400 text-sm">Manage your subscription and usage.</p>
      </motion.div>

      {submitted && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Your upgrade request has been submitted! Admin will review it within 24 hours.
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Current Plan</p>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-bold capitalize">{plan?.plan}</h2>
              <Badge variant={plan?.plan === 'free' ? 'outline' : plan?.plan === 'pro' ? 'cyan' : 'success'}>
                {plan?.status}
              </Badge>
            </div>
            {plan?.expires_at && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Expires: {new Date(plan.expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
          {plan?.plan === 'free' && (
            <Button onClick={() => handleUpgrade('pro')} variant="gradient" className="gap-2">
              <Crown className="h-4 w-4" /> Upgrade to Pro <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Usage Meters */}
        <div className="mt-6 grid sm:grid-cols-2 gap-5">
          {[
            { label: 'Forms Used', used: plan?.usage?.forms || 0, limit: plan?.limits?.forms },
            { label: 'AI Generations (this month)', used: plan?.usage?.ai_generations_this_month || 0, limit: plan?.limits?.ai_generations },
          ].map((meter) => {
            const pct = usagePct(meter.used, meter.limit);
            const unlimited = meter.limit === -1;
            return (
              <div key={meter.label}>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>{meter.label}</span>
                  <span>{unlimited ? `${meter.used} / ∞` : `${meter.used} / ${meter.limit}`}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: unlimited ? '10%' : `${pct}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {PLANS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`relative bg-slate-900 border rounded-2xl p-7 flex flex-col transition-all ${
              p.popular ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-800'
            } ${plan?.plan === p.id ? 'ring-2 ring-cyan-400' : ''}`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold">Most Popular</span>
              </div>
            )}
            {plan?.plan === p.id && (
              <div className="absolute -top-3 right-4">
                <span className="px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-[11px] font-bold">Current</span>
              </div>
            )}

            <div className="mb-5">
              <h3 className="font-display text-2xl font-bold mb-1">{p.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{p.price === 0 ? 'Free' : p.price}</span>
                {p.price > 0 && <span className="text-slate-400 text-sm">EGP/month</span>}
              </div>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {plan?.plan !== p.id && p.id !== 'free' ? (
              <Button onClick={() => handleUpgrade(p.id)} variant={p.popular ? 'gradient' : 'outline'} className="w-full gap-2">
                Upgrade to {p.name} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button disabled variant="secondary" className="w-full opacity-60">
                {plan?.plan === p.id ? 'Current Plan' : 'Free Plan'}
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayment && paymentInfo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">Complete Upgrade</h3>
              <button onClick={() => setShowPayment(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              {paymentInfo.instructions?.map((step: string, i: number) => (
                <div key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-300">{step}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 text-center">
              <p className="text-xs text-slate-400 mb-1">Wallet Number</p>
              <p className="font-mono text-lg font-bold text-blue-400">{paymentInfo.wallet_number}</p>
              <p className="text-xs text-slate-400 mt-1">Amount: <strong className="text-white">{paymentInfo.amount_egp} EGP</strong></p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Screenshot URL (optional)</label>
              <input
                type="text"
                value={screenshot}
                onChange={(e) => setScreenshot(e.target.value)}
                placeholder="Paste Cloudinary or imgur URL..."
                className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <Button onClick={handleSubmitRequest} disabled={submitting} variant="gradient" className="w-full gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {submitting ? 'Submitting...' : 'Submit Upgrade Request'}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
