'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const { verifyEmail } = useAuth();
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await verifyEmail(email, code);
      setSuccess('Account verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP code. Please check console logs in dev mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          Verify Your Email
        </h1>
        <p className="text-sm text-slate-400">
          Enter the 6-digit verification code sent to{' '}
          <span className="text-white font-medium">{email || 'your email'}</span>.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        {!emailParam && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Email Address
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            6-Digit Verification Code
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              placeholder="123456"
              className="pl-10 font-mono tracking-widest text-center text-lg"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Dev Mode Note: Check your backend server log for the generated code.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || code.length !== 6}
          variant="gradient"
          className="w-full h-11 gap-2 text-sm mt-2"
        >
          {loading ? 'Verifying...' : 'Verify Email & Activate'}
        </Button>
      </form>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <span>Didn&apos;t receive code?</span>
        <button
          disabled={resendTimer > 0}
          onClick={() => setResendTimer(60)}
          className="text-cyan-400 font-medium hover:underline disabled:opacity-50 flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
