'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart2, Eye, CheckCircle2, Clock, Users, Download,
  TrendingUp, ArrowLeft, Trash2
} from 'lucide-react';

export default function FormAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [summary, setSummary] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [formId]);

  const loadData = async () => {
    try {
      const [summaryRes, respRes] = await Promise.all([
        api.get(`/responses/${formId}/summary`),
        api.get(`/responses/${formId}?limit=20`)
      ]);
      setSummary(summaryRes.data);
      setResponses(respRes.data.responses || []);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm('Delete this response?')) return;
    await api.delete(`/responses/${formId}/${responseId}`);
    setResponses((p) => p.filter((r) => r.id !== responseId));
    setSummary((p: any) => ({ ...p, total_responses: p.total_responses - 1 }));
  };

  const exportCSV = () => {
    if (responses.length === 0) return;
    const keys = Object.keys(responses[0].data);
    const header = ['submitted_at', ...keys].join(',');
    const rows = responses.map((r) =>
      [r.submitted_at, ...keys.map((k) => JSON.stringify(r.data[k] ?? ''))].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `responses-${formId}.csv`; a.click();
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-slate-800 transition-all">
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div>
          <h1 className="font-display text-3xl font-extrabold">{summary?.title || 'Form Analytics'}</h1>
          <p className="text-slate-400 text-sm">Response data and insights</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button onClick={exportCSV} variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => router.push(`/forms/${formId}`)} variant="gradient" size="sm" className="gap-1.5">
            Edit Form
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Responses', value: summary?.total_responses || 0, icon: Users, color: 'text-blue-400' },
          { label: 'Form Views', value: summary?.views || 0, icon: Eye, color: 'text-cyan-400' },
          { label: 'Completion Rate', value: `${summary?.completion_rate || 0}%`, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Avg Time', value: 'N/A', icon: Clock, color: 'text-amber-400' },
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
      </div>

      {/* Field Summaries */}
      {summary?.fields?.length > 0 && (
        <div className="mb-10 space-y-4">
          <h2 className="font-display text-xl font-bold mb-4">Response Breakdown</h2>
          {summary.fields.map((field: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold text-white">{field.label}</span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">{field.type}</Badge>
                <span className="text-xs text-slate-500 ml-auto">{field.count} responses</span>
              </div>

              {field.frequencies && Object.keys(field.frequencies).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(field.frequencies as Record<string, number>)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([value, count]) => {
                      const pct = Math.round((count / field.count) * 100);
                      return (
                        <div key={value} className="flex items-center gap-3">
                          <span className="text-xs text-slate-300 w-32 truncate">{value}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: 0.1 }}
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-12 text-right">{count} ({pct}%)</span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Text responses — use Export CSV to view all</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Individual Responses Table */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4">Recent Submissions</h2>
        {responses.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm bg-slate-900 rounded-2xl border border-slate-800">
            No responses yet. Share your published form to start collecting data.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">Submitted</th>
                  {Object.keys(responses[0]?.data || {}).slice(0, 4).map((k) => (
                    <th key={k} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 truncate max-w-xs">
                      {k}
                    </th>
                  ))}
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950">
                {responses.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900 transition-colors">
                    <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(r.submitted_at).toLocaleString()}
                    </td>
                    {Object.entries(r.data as Record<string, any>).slice(0, 4).map(([k, v]) => (
                      <td key={k} className="px-5 py-3 text-slate-300 text-xs max-w-xs truncate">
                        {Array.isArray(v) ? v.join(', ') : String(v)}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDeleteResponse(r.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
