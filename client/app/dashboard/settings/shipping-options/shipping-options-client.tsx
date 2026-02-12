'use client';

import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toggleShippingOption } from '@/server/settings';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ShippingOption {
  id: string;
  name: string;
  isActive: boolean;
}

export default function ShippingOptionsClient({
  options
}: {
  options: ShippingOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoading(id);
    try {
      await toggleShippingOption(id, !currentState);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle shipping option:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {options.map((option) => (
        <div
          key={option.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex items-center gap-3">
            <span className="font-medium">{option.name}</span>
            <Badge variant={option.isActive ? 'default' : 'secondary'}>
              {option.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Switch
            checked={option.isActive}
            disabled={loading === option.id}
            onCheckedChange={() => handleToggle(option.id, option.isActive)}
          />
        </div>
      ))}
    </div>
  );
}
