'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { mobileLogin } from '@/server/mobile-auth';
import { useToast } from '@/components/ui/use-toast';
import LiveDate from '@/components/kiosk/live-date';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '600', '900'],
  subsets: ['latin']
});

export default function MobileLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await mobileLogin(email, password);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      if (result.success) {
        if (!result.emailVerified) {
          router.push(`/mobile/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        router.push('/mobile/dashboard/home');
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gradient-to-br from-[#E900C4] to-[#007AEB] px-6 pt-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Image src="/images/direct_logo.png" height={50} width={50} alt="DiReCT's Logo" />
          <p className={`ml-2 ${poppins.className} text-xl font-bold text-white`}>DiReCT+</p>
        </div>
        <span className={`${poppins.className} text-xs font-medium text-white`}>
          <LiveDate />
        </span>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-center text-xl font-bold">Log In</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-11 rounded-lg bg-muted/50"
            required
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-11 rounded-lg bg-muted/50 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="pt-8">
            <Button type="submit" className="h-12 w-full rounded-xl text-sm font-semibold" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Log In
            </Button>
            <Link
              href="/mobile/forgot-password"
              className="block text-center text-xs font-medium text-primary hover:underline mt-3"
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-muted-foreground">
          Don&apos;t have an account? Register{' '}
          <Link href="/mobile/register" className="underline text-foreground">
            here
          </Link>
        </p>
      </div>
    </div>
  );
}
