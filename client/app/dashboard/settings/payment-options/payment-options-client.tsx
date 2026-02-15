'use client';

import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  togglePaymentOption,
  createPaymentOption,
  deletePaymentOption
} from '@/server/settings';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2, Loader2, CreditCard, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentOption {
  id: string;
  name: string;
  isActive: boolean;
}

const paymentLabels: Record<string, string> = {
  GCASH: 'GCash',
  PAYMAYA: 'PayMaya',
  PAYPAL: 'PayPal',
  CREDITCARD: 'Credit Card',
  WALKIN: 'Walk-in',
  PORTAL_GENERATED: 'Portal Generated',
  ATTACHED_FILE: 'Attached File'
};

export default function PaymentOptionsClient({
  options
}: {
  options: PaymentOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoading(id);
    try {
      await togglePaymentOption(id, !currentState);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle payment option:', error);
      toast({ variant: 'destructive', title: 'Failed to update payment option' });
    } finally {
      setLoading(null);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast({ variant: 'destructive', title: 'Please enter a payment method name' });
      return;
    }
    setAdding(true);
    try {
      await createPaymentOption(newName.trim());
      setNewName('');
      setShowAddForm(false);
      router.refresh();
      toast({ title: 'Payment method added successfully' });
    } catch (error: any) {
      if (error?.message?.includes('Unique constraint')) {
        toast({ variant: 'destructive', title: 'This payment method already exists' });
      } else {
        toast({ variant: 'destructive', title: 'Failed to add payment method' });
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${paymentLabels[name] || name}"? This action cannot be undone.`)) {
      return;
    }
    setDeleting(id);
    try {
      await deletePaymentOption(id);
      router.refresh();
      toast({ title: 'Payment method deleted' });
    } catch (error) {
      console.error('Failed to delete payment option:', error);
      toast({ variant: 'destructive', title: 'Failed to delete payment method' });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Section */}
      <div className="flex items-center justify-end gap-2">
        {showAddForm ? (
          <div className="flex w-full items-center gap-2 rounded-lg border bg-muted/30 p-3 sm:w-auto">
            <Input
              placeholder="e.g. BANK_TRANSFER"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="h-9 w-[220px]"
              autoFocus
            />
            <Button size="sm" onClick={handleAdd} disabled={adding}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddForm(false);
                setNewName('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button size="sm" className="gap-1.5" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" />
            Add Payment Method
          </Button>
        )}
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">
                  {paymentLabels[option.name] || option.name}
                </span>
                {paymentLabels[option.name] && (
                  <p className="text-xs text-muted-foreground">
                    {option.name}
                  </p>
                )}
              </div>
              <Badge variant={option.isActive ? 'default' : 'secondary'}>
                {option.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={option.isActive}
                disabled={loading === option.id}
                onCheckedChange={() =>
                  handleToggle(option.id, option.isActive)
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={deleting === option.id}
                onClick={() => handleDelete(option.id, option.name)}
              >
                {deleting === option.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
