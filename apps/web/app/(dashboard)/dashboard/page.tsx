'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Plus, FileText, Eye, BarChart2, Globe, Clock,
  Trash2, ExternalLink, Wand2, ArrowRight, TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { loadForms(); }, []);

  const loadForms = async () => {
    try {
      const res = await api.get('/forms');
      setForms(res.data.forms || []);
    } catch (err) {
      console.error('Failed to load forms', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Delete this form? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/forms/${id}`);
      setForms((p) => p.filter((f) => f.id !== id));
    } catch {
      alert('Failed to delete form');
    } finally {
      setDeleting(null);
    }
  };

  const totalViews = forms.reduce((s, f) => s + (f.views || 0), 0);
  const publishedCount = forms.filter((f) => f.status === 'published').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">
          Your Forms
        </h1>
        <p className="text-slate-400 text-sm">Create, manage, and publish AI-generated forms in seconds.</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
      >
        {[
          { label: 'Total Forms', value: forms.length, icon: FileText, color: 'text-blue-400' },
          { label: 'Published', value: publishedCount, icon: Globe, color: 'text-emerald-400' },
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-cyan-400' },
          { label: 'Drafts', value: forms.length - publishedCount, icon: Clock, color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-slate-800 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-8">
        <Button onClick={() => router.push('/forms/new')} variant="gradient" className="gap-2">
          <Wand2 className="h-4 w-4" /> Generate with AI
        </Button>
        <Button onClick={async () => {
          const res = await api.post('/forms', { title: 'Untitled Form' });
          router.push(`/forms/${res.data.form_id}`);
        }} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Blank Form
        </Button>
      </div>

      {/* Forms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 space-y-5"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-cyan-400" />
          </div>
          <h2 className="font-display text-2xl font-bold">No forms yet</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Generate your first form in seconds using AI. Just describe what you need.
          </p>
          <Button onClick={() => router.push('/forms/new')} variant="gradient" className="gap-2">
            <Wand2 className="h-4 w-4" /> Generate My First Form <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {forms.map((form, i) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/forms/${form.id}`} className="block group">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/50 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <Badge variant={form.status === 'published' ? 'success' : 'outline'} className="text-[11px]">
                      {form.status === 'published' ? '● Live' : '○ Draft'}
                    </Badge>
                  </div>

                  <h3 className="font-display font-bold text-white text-lg mb-1 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {form.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-5">
                    Updated {new Date(form.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {form.views || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {form.status === 'published' && (
                        <a
                          href={`/f/${form.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        onClick={(e) => handleDelete(form.id, e)}
                        disabled={deleting === form.id}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
