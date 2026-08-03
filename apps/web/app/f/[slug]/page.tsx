'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicFormPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [startTime] = useState(Date.now());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${API_URL}/f/${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setForm(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    const completionTime = Math.round((Date.now() - startTime) / 1000);
    try {
      const res = await fetch(`${API_URL}/f/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: values, completion_time: completionTime })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = form?.theme?.primary_color || '#2563EB';
  const bgColor = form?.theme?.background_color || '#FFFFFF';

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="font-display text-2xl font-bold">Form Not Found</h1>
      <p className="text-slate-400 text-sm">This form may have been closed or does not exist.</p>
    </div>
  );

  if (submitted) {
    const successMsg = form?.schema?.settings?.success_message || 'Thank you for submitting!';
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-6 p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="font-display text-3xl font-bold">{successMsg}</h1>
          <p className="text-slate-400 text-sm">Your response has been recorded successfully.</p>
        </motion.div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
          Powered by Formix AI
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Form Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
            {form?.schema?.title || form?.title}
          </h1>
          {form?.schema?.description && (
            <p className="text-slate-500 text-sm leading-relaxed">{form.schema.description}</p>
          )}
          {form?.schema?.settings?.show_progress_bar && (
            <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 w-0 transition-all" />
            </div>
          )}
        </div>

        {/* Sections */}
        {form?.schema?.sections?.map((section: any) => (
          <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5">
            {section.title && (
              <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-3">
                {section.title}
              </h2>
            )}

            {section.fields?.map((field: any) => (
              <div key={field.id} className="space-y-1.5">
                {field.type !== 'divider' && field.type !== 'heading' && field.type !== 'paragraph' && (
                  <label className="block text-sm font-semibold text-slate-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}

                {['text', 'email', 'phone', 'number', 'date', 'time', 'datetime'].includes(field.type) && (
                  <input
                    type={field.type === 'phone' ? 'tel' : field.type === 'datetime' ? 'datetime-local' : field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={values[field.id] || ''}
                    onChange={(e) => setValues((p) => ({ ...p, [field.id]: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                    style={{ '--tw-ring-color': primaryColor + '25' } as any}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    required={field.required}
                    rows={3}
                    placeholder={field.placeholder}
                    value={values[field.id] || ''}
                    onChange={(e) => setValues((p) => ({ ...p, [field.id]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all resize-none"
                  />
                )}

                {field.type === 'select' && (
                  <select
                    required={field.required}
                    value={values[field.id] || ''}
                    onChange={(e) => setValues((p) => ({ ...p, [field.id]: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">Select an option...</option>
                    {field.options?.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && (
                  <div className="space-y-2">
                    {field.options?.map((opt: string) => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          required={field.required}
                          checked={values[field.id] === opt}
                          onChange={() => setValues((p) => ({ ...p, [field.id]: opt }))}
                          className="accent-blue-500"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'checkbox' && (
                  <div className="space-y-2">
                    {field.options?.map((opt: string) => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          value={opt}
                          checked={(values[field.id] || []).includes(opt)}
                          onChange={(e) => {
                            const current = values[field.id] || [];
                            setValues((p) => ({
                              ...p,
                              [field.id]: e.target.checked
                                ? [...current, opt]
                                : current.filter((v: string) => v !== opt)
                            }));
                          }}
                          className="accent-blue-500"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'rating' && (
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((star) => (
                      <button key={star} type="button"
                        onClick={() => setValues((p) => ({ ...p, [field.id]: star }))}
                        className={`text-2xl transition-all ${values[field.id] >= star ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}
                      >★</button>
                    ))}
                  </div>
                )}

                {field.type === 'heading' && (
                  <h3 className="text-xl font-bold text-slate-900">{field.label}</h3>
                )}
                {field.type === 'paragraph' && (
                  <p className="text-sm text-slate-500 leading-relaxed">{field.label}</p>
                )}
                {field.type === 'divider' && (
                  <hr className="border-slate-200" />
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Submit */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {submitError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
            </div>
          )}
          <Button type="submit" disabled={submitting} className="w-full h-11 gap-2" style={{ backgroundColor: primaryColor }}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Submitting...' : 'Submit Response'}
          </Button>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles className="h-3 w-3" /> Powered by Formix AI
          </div>
        </div>
      </form>
    </div>
  );
}
