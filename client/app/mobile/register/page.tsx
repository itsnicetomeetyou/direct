'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { mobileRegister } from '@/server/mobile-auth';
import { useToast } from '@/components/ui/use-toast';

export default function MobileRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
      return;
    }
    if (password.length < 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 8 characters.' });
      return;
    }
    setLoading(true);
    try {
      const result = await mobileRegister(email, password);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      if (result.success) {
        toast({ title: 'Success', description: 'Account created. You can now log in.' });
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
        <p className="text-2xl text-white">Create Account</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-center text-xl font-bold">Register</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-11 rounded-lg bg-muted/50"
            required
          />
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="h-11 rounded-lg bg-muted/50"
            required
          />
          <Input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="h-11 rounded-lg bg-muted/50"
            required
          />

          <div className="pt-8">
            <Button type="submit" className="h-12 w-full rounded-xl text-sm font-semibold" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Register
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-muted-foreground">
          By signing up, you agree to our Terms of Use and Privacy Policy
        </p>
        <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
          Already have an account?{' '}
          <Link href="/mobile/login" className="underline text-foreground">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
