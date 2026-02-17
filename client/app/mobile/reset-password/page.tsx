'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { mobileResetPassword } from '@/server/mobile-auth';
import { useToast } from '@/components/ui/use-toast';

export default function MobileResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token') || '';
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
      return;
    }

    if (!resetToken) {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid reset link. Please start over.' });
      return;
    }

    setLoading(true);
    try {
      const result = await mobileResetPassword(resetToken, password);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      if (result.success) {
        toast({ title: 'Success', description: 'Your password has been reset. Please log in.' });
        router.push('/mobile/login');
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#E900C4] to-[#007AEB] px-6 pt-20">
      <div className="mb-8">
        <p className="text-2xl text-white">New Password</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-2 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <ShieldCheck className="h-7 w-7 text-green-600" />
          </div>
        </div>
        <h2 className="mb-1 text-center text-xl font-bold">Set New Password</h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Enter your new password below. It must be at least 6 characters.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-11 rounded-lg bg-muted/50 pr-10"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="h-11 rounded-lg bg-muted/50 pr-10"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-sm font-semibold"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset Password
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-muted-foreground">
          Remember your password?{' '}
          <Link href="/mobile/login" className="underline text-foreground">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
