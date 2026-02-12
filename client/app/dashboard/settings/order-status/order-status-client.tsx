'use client';

import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  toggleOrderStatus,
  createOrderStatus,
  deleteOrderStatus
} from '@/server/settings';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

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
  COMPLETED: {
    label: 'Completed',
    color: 'bg-emerald-100 text-emerald-800'
  },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
};

export default function OrderStatusClient({
  statuses
}: {
  statuses: OrderStatus[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [newStatusName, setNewStatusName] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OrderStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoading(id);
    try {
      await toggleOrderStatus(id, !currentState);
      router.refresh();
    } catch (error) {
      // silently handle
    } finally {
      setLoading(null);
    }
  };

  const handleAdd = async () => {
    if (!newStatusName.trim()) return;
    setSubmitting(true);
    try {
      await createOrderStatus(newStatusName.trim());
      setNewStatusName('');
      setAddDialogOpen(false);
      router.refresh();
    } catch (error) {
      // silently handle
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteOrderStatus(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      // silently handle
    } finally {
      setSubmitting(false);
    }
  };

  const getDisplayName = (name: string) => {
    return STATUS_DISPLAY[name]?.label || name.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Status
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Order Status</DialogTitle>
              <DialogDescription>
                Enter the name for the new order status. It will be stored in
                uppercase without spaces (e.g. &quot;Ready to Ship&quot; becomes
                &quot;READYTOSHIP&quot;).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Input
                placeholder="e.g. Ready to Ship"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              {newStatusName.trim() && (
                <p className="text-xs text-muted-foreground">
                  Will be stored as:{' '}
                  <span className="font-mono font-semibold">
                    {newStatusName.toUpperCase().replace(/\s+/g, '')}
                  </span>
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!newStatusName.trim() || submitting}
              >
                {submitting ? 'Adding...' : 'Add Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statuses.map((status) => {
          const displayName = getDisplayName(status.name);
          return (
            <div
              key={status.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{displayName}</span>
                <Badge variant={status.isActive ? 'default' : 'secondary'}>
                  {status.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={status.isActive}
                  disabled={loading === status.id}
                  onCheckedChange={() =>
                    handleToggle(status.id, status.isActive)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    setDeleteTarget(status);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the status &quot;
              {deleteTarget ? getDisplayName(deleteTarget.name) : ''}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
