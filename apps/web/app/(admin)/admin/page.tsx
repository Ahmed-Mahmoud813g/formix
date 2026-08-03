'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, BarChart2, CheckCircle2, XCircle, AlertCircle,
  Shield, Clock, TrendingUp, FileText, Zap
} from 'lucide-react';

type Tab = 'overview' | 'users' | 'subscriptions';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [analyticsRes, usersRes, subsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/subscriptions')
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data.users || []);
      setSubscriptions(subsRes.data.subscriptions || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('Admin access required. Redirect to dashboard.');
        window.location.href = '/dashboard';
      }
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleSuspend = async (userId: string) => {
    await api.put(`/admin/users/${userId}/suspend`);
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, is_active: false } : u));
    notify('User suspended');
  };
  const handleActivate = async (userId: string) => {
    await api.put(`/admin/users/${userId}/activate`);
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, is_active: true } : u));
    notify('User activated');
  };

  const handleApprove = async (subId: string) => {
    await api.put(`/admin/subscriptions/${subId}/approve`, { expires_days: 30 });
    setSubscriptions((p) => p.map((s) => s.id === subId ? { ...s, status: 'active' } : s));
    notify('Subscription approved — 30 days');
  };
  const handleReject = async (subId: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    await api.put(`/admin/subscriptions/${subId}/reject`, { reason });
    setSubscriptions((p) => p.map((s) => s.id === subId ? { ...s, status: 'rejected' } : s));
    notify('Subscription rejected');
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-red-400 border-t-transparent animate-spin" />
    </div>
  );

  const pendingSubs = subscriptions.filter((s) => s.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      {actionMsg && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-50 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {actionMsg}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-4xl font-extrabold text-white mb-1">Admin Panel</h1>
        <p className="text-slate-400 text-sm">Manage users, subscriptions, and platform stats.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border border-slate-800 rounded-xl p-1 mb-8 max-w-sm">
        {(['overview', 'users', 'subscriptions'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t} {t === 'subscriptions' && pendingSubs.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">{pendingSubs.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Users', value: analytics.users.total, icon: Users, color: 'text-blue-400' },
            { label: 'Total Forms', value: analytics.forms.total, icon: FileText, color: 'text-cyan-400' },
            { label: 'Responses', value: analytics.responses.total, icon: BarChart2, color: 'text-emerald-400' },
            { label: 'AI Calls', value: analytics.ai_usage.total_calls, icon: Zap, color: 'text-amber-400' },
            { label: 'Pending Approvals', value: analytics.subscriptions.pending_approval, icon: Clock, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className={`mb-2 ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                {['Name', 'Email', 'Verified', 'Status', 'Admin', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900 transition-colors">
                  <td className="px-5 py-3 text-white font-medium text-xs truncate max-w-[140px]">{u.full_name}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs truncate max-w-[180px]">{u.email}</td>
                  <td className="px-5 py-3">
                    {u.is_verified ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-slate-600" />}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={u.is_active ? 'success' : 'warning'} className="text-[10px]">
                      {u.is_active ? 'Active' : 'Suspended'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {u.is_admin && <Shield className="h-4 w-4 text-red-400" />}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    {!u.is_admin && (
                      u.is_active
                        ? <Button onClick={() => handleSuspend(u.id)} variant="outline" size="sm" className="text-amber-400 border-amber-400/20 h-7 text-[11px]">Suspend</Button>
                        : <Button onClick={() => handleActivate(u.id)} variant="outline" size="sm" className="text-emerald-400 border-emerald-400/20 h-7 text-[11px]">Activate</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SUBSCRIPTIONS ── */}
      {tab === 'subscriptions' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                {['User ID', 'Plan', 'Status', 'Screenshot', 'Submitted', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950">
              {subscriptions.map((s) => (
                <tr key={s.id} className={`hover:bg-slate-900 transition-colors ${s.status === 'pending' ? 'bg-amber-500/5' : ''}`}>
                  <td className="px-5 py-3 text-slate-400 text-xs font-mono">{s.user_id.slice(0, 8)}...</td>
                  <td className="px-5 py-3">
                    <Badge variant={s.plan === 'max' ? 'success' : 'cyan'} className="capitalize text-[10px]">{s.plan}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={s.status === 'active' ? 'success' : s.status === 'pending' ? 'warning' : 'outline'} className="text-[10px]">
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {s.payment_screenshot
                      ? <a href={s.payment_screenshot} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs hover:underline">View</a>
                      : <span className="text-slate-600 text-xs">None</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    {s.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button onClick={() => handleApprove(s.id)} size="sm" variant="default" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button onClick={() => handleReject(s.id)} size="sm" variant="outline" className="h-7 text-[11px] text-red-400 border-red-400/20">
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
