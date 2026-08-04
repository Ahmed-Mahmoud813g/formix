'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Save, Globe, EyeOff, Trash2, Wand2, Share2, CheckCircle2,
  Plus, GripVertical, Settings, Eye, Sparkles, Link2, Code2, X, Loader2,
  ArrowLeft, Send, AlertCircle
} from 'lucide-react';

interface FormField {
  id: string; type: string; label: string; placeholder?: string;
  required: boolean; order: number; options?: string[]; validation?: any;
}
interface FormSection {
  id: string; title: string; order: number; fields: FormField[];
}

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      const res = await api.get(`/forms/${formId}`);
      setForm(res.data);
      setSchema(res.data.schema);
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/forms/${formId}`, { schema, title: schema?.title, description: schema?.description });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    await handleSave();
    setPublishing(true);
    try {
      const res = await api.post(`/forms/${formId}/publish`);
      setPublishResult(res.data);
      setForm((prev: any) => ({ ...prev, status: 'published' }));
      setShowPublishModal(true);
    } catch (err) {
      console.error('Publish failed', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    await api.post(`/forms/${formId}/unpublish`);
    setForm((prev: any) => ({ ...prev, status: 'draft' }));
    setPublishResult(null);
  };

  const handleAiEdit = async () => {
    if (!aiInstruction.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/edit', { form_id: formId, instruction: aiInstruction });
      setSchema(res.data.schema);
      setAiInstruction('');
    } catch (err) {
      console.error('AI edit failed', err);
    } finally {
      setAiLoading(false);
    }
  };

  const updateFieldLabel = (sectionIdx: number, fieldIdx: number, newLabel: string) => {
    setSchema((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.sections[sectionIdx].fields[fieldIdx].label = newLabel;
      return updated;
    });
  };

  const toggleFieldRequired = (sectionIdx: number, fieldIdx: number) => {
    setSchema((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.sections[sectionIdx].fields[fieldIdx].required = !updated.sections[sectionIdx].fields[fieldIdx].required;
      return updated;
    });
  };

  const removeField = (sectionIdx: number, fieldIdx: number) => {
    setSchema((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.sections[sectionIdx].fields.splice(fieldIdx, 1);
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading form builder...</p>
        </div>
      </div>
    );
  }

  const primaryColor = schema?.theme?.primary_color || '#2563EB';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Bar Header */}
      <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-slate-800 hover:bg-slate-900 text-slate-300">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <input
            type="text"
            value={schema?.title || ''}
            onChange={(e) => setSchema((p: any) => ({ ...p, title: e.target.value }))}
            className="bg-transparent text-white font-display font-bold text-lg focus:outline-none focus:border-b focus:border-cyan-400 truncate max-w-xs"
          />
          <Badge variant={form?.status === 'published' ? 'success' : 'outline'} className="text-[11px] shrink-0">
            {form?.status === 'published' ? '● Published' : '○ Draft'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex border border-slate-700 rounded-xl overflow-hidden p-0.5 bg-slate-900">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${activeTab === 'builder' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Builder
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${activeTab === 'preview' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              <Eye className="h-3.5 w-3.5" />
              Live Preview
            </button>
          </div>

          <Button onClick={handleSave} disabled={saving} variant="secondary" size="sm" className="gap-1.5">
            {saved ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
          </Button>

          {form?.status === 'published' ? (
            <Button onClick={handleUnpublish} variant="outline" size="sm" className="gap-1.5 text-amber-400 border-amber-400/30">
              <EyeOff className="h-3.5 w-3.5" /> Unpublish
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={publishing} variant="gradient" size="sm" className="gap-1.5">
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
              Publish
            </Button>
          )}

          {form?.status === 'published' && publishResult && (
            <Button onClick={() => setShowPublishModal(true)} variant="secondary" size="sm" className="gap-1.5">
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
          )}
        </div>
      </div>

      {/* AI Prompt Bar */}
      <div className="border-b border-slate-800/60 bg-slate-900/60 px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <Wand2 className="h-4 w-4 text-cyan-400 shrink-0" />
        <input
          type="text"
          value={aiInstruction}
          onChange={(e) => setAiInstruction(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAiEdit()}
          placeholder='Edit with AI: "Make all fields required" | "Add a phone field" | "Translate to Arabic"...'
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
        />
        <Button onClick={handleAiEdit} disabled={aiLoading || !aiInstruction.trim()} variant="default" size="sm" className="gap-1.5 shrink-0">
          {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {aiLoading ? 'Applying...' : 'Apply AI'}
        </Button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'builder' ? (
        /* BUILDER TAB */
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
          {/* Form Description */}
          <div className="space-y-2">
            <input
              type="text"
              value={schema?.description || ''}
              onChange={(e) => setSchema((p: any) => ({ ...p, description: e.target.value }))}
              placeholder="Form description (optional)"
              className="w-full bg-transparent text-slate-400 text-sm focus:outline-none focus:text-slate-200 placeholder:text-slate-600 border-b border-transparent focus:border-slate-700 pb-1 transition-all"
            />
          </div>

          {/* Sections */}
          {schema?.sections?.map((section: FormSection, sectionIdx: number) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <GripVertical className="h-5 w-5 text-slate-600" />
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setSchema((prev: any) => {
                      const u = JSON.parse(JSON.stringify(prev));
                      u.sections[sectionIdx].title = e.target.value;
                      return u;
                    });
                  }}
                  className="flex-1 bg-transparent font-display font-bold text-lg text-white focus:outline-none"
                  placeholder="Section title..."
                />
                <Badge variant="outline" className="text-[10px]">
                  {section.fields?.length || 0} fields
                </Badge>
              </div>

              <div className="space-y-3">
                {section.fields?.map((field: FormField, fieldIdx: number) => (
                  <div
                    key={field.id}
                    className="group flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all"
                  >
                    <GripVertical className="h-4 w-4 text-slate-700 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {field.type}
                        </Badge>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateFieldLabel(sectionIdx, fieldIdx, e.target.value)}
                          className="flex-1 min-w-0 bg-transparent text-sm font-medium text-white focus:outline-none"
                          placeholder="Field label"
                        />
                        <button
                          onClick={() => toggleFieldRequired(sectionIdx, fieldIdx)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all ${
                            field.required ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {field.required ? 'Required' : 'Optional'}
                        </button>
                      </div>
                      {field.placeholder && (
                        <p className="text-xs text-slate-500 truncate">{field.placeholder}</p>
                      )}
                      {field.options && field.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {field.options.map((opt) => (
                            <span key={opt} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeField(sectionIdx, fieldIdx)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => {
                    const newField: FormField = {
                      id: crypto.randomUUID(),
                      type: 'text', label: 'New Field',
                      placeholder: 'Enter value', required: false, order: section.fields.length + 1
                    };
                    setSchema((prev: any) => {
                      const u = JSON.parse(JSON.stringify(prev));
                      u.sections[sectionIdx].fields.push(newField);
                      return u;
                    });
                  }}
                  className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/40 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Field
                </button>
              </div>
            </motion.div>
          ))}

          {/* Add Section Button */}
          <button
            onClick={() => {
              const newSection: FormSection = {
                id: crypto.randomUUID(),
                title: 'New Section',
                order: (schema?.sections?.length || 0) + 1,
                fields: []
              };
              setSchema((prev: any) => ({ ...prev, sections: [...(prev?.sections || []), newSection] }));
            }}
            className="w-full py-4 rounded-2xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-medium transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add New Section
          </button>
        </div>
      ) : (
        /* LIVE PREVIEW TAB */
        <div className="flex-1 bg-slate-900/40 py-8 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Live Interactive Preview Mode — Test inputs in real-time
              </span>
              <button onClick={() => setActiveTab('builder')} className="underline font-semibold hover:text-cyan-300">
                Back to Builder
              </button>
            </div>

            {previewSubmitted ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white">Preview Submission Recorded</h2>
                <p className="text-slate-400 text-sm">This is how respondents will see your thank-you screen!</p>
                <Button onClick={() => setPreviewSubmitted(false)} variant="outline" size="sm">
                  Reset Preview Form
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setPreviewSubmitted(true); }} className="space-y-6">
                {/* Form Header */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
                  <h1 className="font-display text-3xl font-bold text-white mb-2">
                    {schema?.title || 'Untitled Form'}
                  </h1>
                  {schema?.description && (
                    <p className="text-slate-400 text-sm leading-relaxed">{schema.description}</p>
                  )}
                </div>

                {/* Sections */}
                {schema?.sections?.map((section: any) => (
                  <div key={section.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-8 space-y-5 shadow-xl">
                    {section.title && (
                      <h2 className="font-semibold text-white text-lg border-b border-slate-800 pb-3">
                        {section.title}
                      </h2>
                    )}

                    {section.fields?.map((field: any) => (
                      <div key={field.id} className="space-y-2">
                        {field.type !== 'divider' && field.type !== 'heading' && field.type !== 'paragraph' && (
                          <label className="block text-sm font-semibold text-slate-200">
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </label>
                        )}

                        {['text', 'email', 'phone', 'number', 'date', 'time', 'datetime'].includes(field.type) && (
                          <input
                            type={field.type === 'phone' ? 'tel' : field.type === 'datetime' ? 'datetime-local' : field.type}
                            required={field.required}
                            placeholder={field.placeholder}
                            value={previewValues[field.id] || ''}
                            onChange={(e) => setPreviewValues((p) => ({ ...p, [field.id]: e.target.value }))}
                            className="w-full h-11 rounded-xl border border-slate-700 bg-slate-950 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition-all"
                          />
                        )}

                        {field.type === 'textarea' && (
                          <textarea
                            required={field.required}
                            rows={3}
                            placeholder={field.placeholder}
                            value={previewValues[field.id] || ''}
                            onChange={(e) => setPreviewValues((p) => ({ ...p, [field.id]: e.target.value }))}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition-all resize-none"
                          />
                        )}

                        {field.type === 'select' && (
                          <select
                            required={field.required}
                            value={previewValues[field.id] || ''}
                            onChange={(e) => setPreviewValues((p) => ({ ...p, [field.id]: e.target.value }))}
                            className="w-full h-11 rounded-xl border border-slate-700 bg-slate-950 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition-all"
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
                              <label key={opt} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={field.id}
                                  value={opt}
                                  required={field.required}
                                  checked={previewValues[field.id] === opt}
                                  onChange={() => setPreviewValues((p) => ({ ...p, [field.id]: opt }))}
                                  className="accent-cyan-400"
                                />
                                <span className="text-sm text-slate-300">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === 'checkbox' && (
                          <div className="space-y-2">
                            {field.options?.map((opt: string) => (
                              <label key={opt} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={opt}
                                  checked={(previewValues[field.id] || []).includes(opt)}
                                  onChange={(e) => {
                                    const current = previewValues[field.id] || [];
                                    setPreviewValues((p) => ({
                                      ...p,
                                      [field.id]: e.target.checked
                                        ? [...current, opt]
                                        : current.filter((v: string) => v !== opt)
                                    }));
                                  }}
                                  className="accent-cyan-400"
                                />
                                <span className="text-sm text-slate-300">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === 'rating' && (
                          <div className="flex gap-2">
                            {[1,2,3,4,5].map((star) => (
                              <button key={star} type="button"
                                onClick={() => setPreviewValues((p) => ({ ...p, [field.id]: star }))}
                                className={`text-2xl transition-all ${previewValues[field.id] >= star ? 'text-amber-400' : 'text-slate-600 hover:text-amber-300'}`}
                              >★</button>
                            ))}
                          </div>
                        )}

                        {field.type === 'heading' && (
                          <h3 className="text-xl font-bold text-white">{field.label}</h3>
                        )}
                        {field.type === 'paragraph' && (
                          <p className="text-sm text-slate-400 leading-relaxed">{field.label}</p>
                        )}
                        {field.type === 'divider' && (
                          <hr className="border-slate-800" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Preview Submit */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                  <Button type="submit" variant="gradient" className="w-full h-11 gap-2">
                    <Send className="h-4 w-4" /> Submit Response (Preview)
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublishModal && publishResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Form Published!</h3>
                    <p className="text-xs text-slate-400">Your form is now live and accepting responses.</p>
                  </div>
                </div>
                <button onClick={() => setShowPublishModal(false)} className="text-slate-500 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Public URL</label>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <Link2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <code className="text-xs text-cyan-400 flex-1 truncate">
                      {typeof window !== 'undefined' ? window.location.origin : ''}{publishResult.public_url}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}${publishResult.public_url}`)}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Embed Code</label>
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <Code2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <code className="text-[11px] text-slate-300 flex-1 break-all font-mono">
                      {publishResult.embed_code}
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href={publishResult.public_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="gradient" className="w-full gap-2">
                    <Eye className="h-4 w-4" /> View Live Form
                  </Button>
                </a>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="secondary" className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
