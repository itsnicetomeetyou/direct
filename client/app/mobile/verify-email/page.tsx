'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { mobileSendOtp, mobileVerifyOtp } from '@/server/mobile-auth';
import { useToast } from '@/components/ui/use-toast';

export default function MobileVerifyEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { toast } = useToast();

  const sendOtp = async () => {
    if (!email) return;
    setSending(true);
    try {
      const result = await mobileSendOtp(email);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      if (result.otpToken) {
        setOtpToken(result.otpToken);
        toast({ title: 'OTP Sent', description: `Verification code sent to ${email}` });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send OTP.' });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 4) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter the 4-digit code.' });
      return;
    }
    setLoading(true);
    try {
      const result = await mobileVerifyOtp(otpToken, code);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      if (result.success) {
        toast({ title: 'Verified', description: 'Your email has been verified.' });
        router.push('/mobile/register-info');
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
        <p className="text-2xl text-white">Verify Email</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-center text-xl font-bold">Email Confirmation</h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Enter the 4-digit code sent to <span className="font-medium text-foreground">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
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

          <Button type="submit" className="h-12 w-full rounded-xl text-sm font-semibold" disabled={loading || !otpToken}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify
          </Button>
        </form>

        <button
          onClick={sendOtp}
          disabled={sending}
          className="mt-4 block w-full text-center text-xs font-medium text-primary hover:underline disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}
