'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, XCircle } from 'lucide-react';
import { mobileCancelOrder } from '@/server/mobile-auth';
import { useToast } from '@/components/ui/use-toast';

export default function MobileCancelButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setLoading(true);
    try {
      const result = await mobileCancelOrder(orderId);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      toast({ title: 'Order Cancelled', description: 'Your order has been cancelled.' });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to cancel.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      className="h-12 w-full rounded-xl"
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <XCircle className="mr-2 h-4 w-4" />
      )}
      Cancel Order
    </Button>
  );
}
