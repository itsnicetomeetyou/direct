'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { mobileLogout } from '@/server/mobile-auth';

export default function MobileLogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    await mobileLogout();
    router.push('/mobile');
  };

  return (
    <Button
      variant="destructive"
      className="h-12 w-full rounded-xl"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Log Out
    </Button>
  );
}
