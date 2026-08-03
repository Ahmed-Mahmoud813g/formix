'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Wand2, Globe, ArrowRight, Loader2,
  FileText, CheckCircle2, AlertCircle
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
];

const EXAMPLE_PROMPTS = [
  'Create a job application form for a call center representative',
  'Build a customer satisfaction survey with NPS rating',
  'Generate a medical appointment booking form',
  'Make an event registration form for a tech conference',
  'Create a product feedback form for an e-commerce store',
];

export default function NewFormPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedForm, setGeneratedForm] = useState<any>(null);
  const [formId, setFormId] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setError('');
    setLoading(true);
    setGeneratedForm(null);

    try {
      const res = await api.post('/ai/generate', { prompt, language });
      setGeneratedForm(res.data.schema);
      setFormId(res.data.form_id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <Badge variant="cyan" className="px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-cyan-400" /> Powered by Gemini 1.5 Flash
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
            AI Form Generator
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Describe the form you need in plain language — Formix generates a complete, professional schema in seconds.
          </p>
        </motion.div>

        {/* Prompt Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl"
        >
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Prompt Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Wand2 className="h-4 w-4 text-cyan-400" /> Describe Your Form
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                required
                placeholder="e.g. Create a job application form for a call center with personal info, work experience, and shift preference sections..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>

            {/* Quick Prompt Examples */}
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium">Quick Examples:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setPrompt(ex)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-cyan-400" /> Output Language
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      language === lang.code
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              variant="gradient"
              size="lg"
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating with Gemini 1.5...
                </>
              ) : (
                <>
                  Generate Form Now <Sparkles className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Generated Form Preview */}
        <AnimatePresence>
          {generatedForm && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900/80 border border-slate-700 rounded-3xl p-8 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Generated Successfully</p>
                    <h2 className="font-display text-xl font-bold text-white">{generatedForm.title}</h2>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/forms/${formId}`)}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" /> Open Builder
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => router.push(`/forms/${formId}`)}
                    className="gap-2"
                  >
                    Edit & Publish <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Form Preview Render */}
              <div className="space-y-6 max-w-2xl">
                {generatedForm.description && (
                  <p className="text-sm text-slate-400 italic">{generatedForm.description}</p>
                )}

                {generatedForm.sections?.map((section: any) => (
                  <div key={section.id} className="space-y-4">
                    {section.title && (
                      <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                        {section.title}
                      </h3>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.fields?.map((field: any) => (
                        <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </label>
                          {['text','email','phone','number','date','time'].includes(field.type) && (
                            <input
                              type="text"
                              disabled
                              placeholder={field.placeholder || ''}
                              className="w-full h-9 rounded-lg bg-slate-950 border border-slate-800 px-3 text-xs text-slate-400"
                            />
                          )}
                          {field.type === 'textarea' && (
                            <textarea
                              disabled
                              rows={2}
                              placeholder={field.placeholder || ''}
                              className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-400 resize-none"
                            />
                          )}
                          {field.type === 'select' && (
                            <select
                              disabled
                              className="w-full h-9 rounded-lg bg-slate-950 border border-slate-800 px-3 text-xs text-slate-400"
                            >
                              {field.options?.map((opt: string) => (
                                <option key={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                          {(field.type === 'radio' || field.type === 'checkbox') && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {field.options?.map((opt: string) => (
                                <span key={opt} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                          {field.type === 'rating' && (
                            <div className="text-amber-400 text-lg pt-1">★ ★ ★ ★ ★</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
