'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, Sparkles, CheckCircle2, RotateCcw, Send, Play } from 'lucide-react';

const PRESET_PROMPTS = [
  {
    label: 'Customer Feedback',
    prompt: 'Create a customer feedback survey for an e-commerce store with rating and comment fields.',
    form: {
      title: 'E-Commerce Feedback Survey',
      description: 'We value your opinion! Tell us about your recent order.',
      fields: [
        { label: 'Overall Satisfaction', type: 'rating', required: true },
        { label: 'Order Number', type: 'text', placeholder: 'e.g. #ORD-9821' },
        { label: 'What did you enjoy most?', type: 'textarea', placeholder: 'Share your experience...' },
        { label: 'Would you recommend us to a friend?', type: 'radio', options: ['Definitely', 'Maybe', 'No'] },
      ],
    },
  },
  {
    label: 'Event Registration',
    prompt: 'Build a tech conference ticket registration form with workshop choices.',
    form: {
      title: 'Tech Summit 2026 Registration',
      description: 'Reserve your pass for Cairo Tech Summit 2026.',
      fields: [
        { label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
        { label: 'Work Email', type: 'email', required: true, placeholder: 'jane@company.com' },
        { label: 'Select Track', type: 'select', options: ['AI & Machine Learning', 'Web Development', 'Cloud & DevOps'] },
        { label: 'Dietary Preferences', type: 'checkbox', options: ['Vegetarian', 'Vegan', 'Halal', 'None'] },
      ],
    },
  },
  {
    label: 'استبيان توظيف (عربي)',
    prompt: 'أنشئ نموذج تقديم على وظيفة ممثل خدمة عملاء باللغة العربية.',
    form: {
      title: 'نموذج التقديم على وظيفة خدمة العملاء',
      description: 'يسعدنا انضمامك لفريقنا. يرجى ملء بياناتك الشخصية والمهنية.',
      fields: [
        { label: 'الاسم بالكامل', type: 'text', required: true, placeholder: 'أحمد محمود' },
        { label: 'رقم الهاتف المحمول', type: 'phone', required: true, placeholder: '01000000000' },
        { label: 'مستوى اللغة الإنجليزية', type: 'select', options: ['مبتدئ', 'متوسط', 'متقدم', 'طلاقة'] },
        { label: 'ملاحظات إضافية', type: 'textarea', placeholder: 'اكتب أي خبرات سابقة...' },
      ],
    },
  },
];

export function LiveDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customPrompt, setCustomPrompt] = useState(PRESET_PROMPTS[0].prompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeForm, setActiveForm] = useState(PRESET_PROMPTS[0].form);

  const handleSelectPreset = (index: number) => {
    setSelectedIndex(index);
    setCustomPrompt(PRESET_PROMPTS[index].prompt);
    setIsGenerating(true);
    setTimeout(() => {
      setActiveForm(PRESET_PROMPTS[index].form);
      setIsGenerating(false);
    }, 600);
  };

  const handleGenerateCustom = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setActiveForm({
        title: 'Custom AI Generated Form',
        description: `Generated based on: "${customPrompt}"`,
        fields: [
          { label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your name' },
          { label: 'Email Address', type: 'email', required: true, placeholder: 'name@domain.com' },
          { label: 'Your Specific Request Details', type: 'textarea', placeholder: 'Detailed response...' },
        ],
      });
      setIsGenerating(false);
    }, 800);
  };

  return (
    <section id="demo" className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <Badge variant="cyan" className="px-3.5 py-1">
            <Play className="h-3.5 w-3.5 mr-1.5 text-cyan-400" /> Live Interactive Sandbox
          </Badge>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
            Try AI Form Generation Right Now
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Pick a prompt preset or type your own instruction to see Formix render live forms.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {PRESET_PROMPTS.map((preset, index) => (
            <button
              key={preset.label}
              onClick={() => handleSelectPreset(index)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedIndex === index
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Prompt Input Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full pl-3 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe your form..."
                className="w-full bg-transparent text-sm sm:text-base text-white focus:outline-none placeholder:text-slate-500"
              />
            </div>
            <Button
              onClick={handleGenerateCustom}
              disabled={isGenerating}
              variant="gradient"
              className="w-full sm:w-auto shrink-0 gap-2"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  Generate Preview <Sparkles className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Rendered Live Form Card */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative min-h-[380px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center space-y-4 z-20"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                  <p className="text-sm font-medium text-slate-300 font-mono">
                    Gemini 1.5 is generating JSON Schema...
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div>
              <div className="border-b border-slate-800 pb-5 mb-6 text-left">
                <Badge variant="cyan" className="mb-2">
                  Generated Form Schema
                </Badge>
                <h3 className="text-2xl font-bold font-display text-white">{activeForm.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{activeForm.description}</p>
              </div>

              <div className="space-y-5 text-left">
                {activeForm.fields.map((field, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>

                    {field.type === 'text' || field.type === 'email' || field.type === 'phone' ? (
                      <input
                        type="text"
                        disabled
                        placeholder={field.placeholder || ''}
                        className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-300"
                      />
                    ) : field.type === 'textarea' ? (
                      <textarea
                        disabled
                        rows={2}
                        placeholder={field.placeholder || ''}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-300"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        disabled
                        className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-300"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'radio' || field.type === 'checkbox' ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {field.options?.map((opt) => (
                          <span
                            key={opt}
                            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    ) : field.type === 'rating' ? (
                      <div className="flex gap-2 pt-1 text-amber-400 text-xl">
                        ★ ★ ★ ★ ★
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Generated with strict TypeScript validation
              </span>
              <Button variant="gradient" size="sm" className="gap-2">
                Submit Form <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
