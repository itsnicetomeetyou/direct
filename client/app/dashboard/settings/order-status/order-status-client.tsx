'use client';

import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toggleOrderStatus } from '@/server/settings';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface OrderStatus {
  id: string;
  name: string;
  isActive: boolean;
}

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  READYTOPICKUP: {
    label: 'Ready to Pick Up',
    color: 'bg-purple-100 text-purple-800'
  },
  OUTFORDELIVERY: {
    label: 'Out for Delivery',
    color: 'bg-indigo-100 text-indigo-800'
  },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
};

export default function OrderStatusClient({
  statuses
}: {
  statuses: OrderStatus[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoading(id);
    try {
      await toggleOrderStatus(id, !currentState);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle order status:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statuses.map((status) => {
        const display = STATUS_DISPLAY[status.name] || {
          label: status.name,
          color: ''
        };
        return (
          <div
            key={status.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{display.label}</span>
              <Badge variant={status.isActive ? 'default' : 'secondary'}>
                {status.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <Switch
              checked={status.isActive}
              disabled={loading === status.id}
              onCheckedChange={() => handleToggle(status.id, status.isActive)}
            />
          </div>
        );
      })}
    </div>
  );
}
