'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { mobileForgotPassword, mobileVerifyResetOtp } from '@/server/mobile-auth';
import { useToast } from '@/components/ui/use-toast';

export default function MobileForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter your email.' });
      return;
    }
    setLoading(true);
    try {
      const result = await mobileForgotPassword(email);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      if (result.success && result.otpToken) {
        setOtpToken(result.otpToken);
        setStep('otp');
        toast({ title: 'Code Sent', description: `A reset code has been sent to ${email}` });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setSending(true);
    try {
      const result = await mobileForgotPassword(email);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      if (result.success && result.otpToken) {
        setOtpToken(result.otpToken);
        setOtp(['', '', '', '']);
        toast({ title: 'Code Resent', description: `A new code has been sent to ${email}` });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to resend code.' });
    } finally {
      setSending(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 4) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter the 4-digit code.' });
      return;
    }
    setLoading(true);
    try {
      const result = await mobileVerifyResetOtp(otpToken, code);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      if (result.success && result.resetToken) {
        router.push(`/mobile/reset-password?token=${encodeURIComponent(result.resetToken)}`);
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gradient-to-br from-[#E900C4] to-[#007AEB] px-6 pt-20">
      <div className="mb-8">
        <p className="text-2xl text-white">Forgot Password</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-xl">
        {step === 'email' ? (
          <>
            <div className="mb-2 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h2 className="mb-1 text-center text-xl font-bold">Reset Password</h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a code to reset your password.
            </p>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-11 rounded-lg bg-muted/50"
                required
              />

              <Button
                type="submit"
                className="h-12 w-full rounded-xl text-sm font-semibold"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Reset Code
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="mb-2 text-center text-xl font-bold">Enter Code</h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Enter the 4-digit code sent to{' '}
              <span className="font-medium text-foreground">{email}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={loading}
                    className="h-14 w-14 rounded-lg bg-muted/50 text-center text-2xl font-bold"
                  />
                ))}
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl text-sm font-semibold"
                disabled={loading || !otpToken}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify Code
              </Button>
            </form>

            <button
              onClick={handleResend}
              disabled={sending}
              className="mt-4 block w-full text-center text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Resend Code'}
            </button>
          </>
        )}

        <p className="mt-6 text-center text-xs font-medium text-muted-foreground">
          <Link href="/mobile/login" className="inline-flex items-center gap-1 text-foreground underline">
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
