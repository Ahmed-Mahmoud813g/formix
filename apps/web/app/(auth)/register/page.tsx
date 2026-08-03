'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        phone: phone || undefined,
        password,
      });
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your info.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          Create Your Formix Account
        </h1>
        <p className="text-sm text-slate-400">
          Start generating AI forms for free in under 60 seconds.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Full Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ahmed Mahmoud"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Email Address <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmed@example.com"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20 100 000 0000"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="pl-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="gradient"
          className="w-full h-11 gap-2 text-sm mt-2"
        >
          {loading ? (
            'Creating Account...'
          ) : (
            <>
              Continue to Verification <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="text-cyan-400 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
