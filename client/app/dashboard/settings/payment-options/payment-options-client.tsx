'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  togglePaymentOption,
  createPaymentOption,
  deletePaymentOption
} from '@/server/settings';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
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
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentOption | null>(null);
  const [updateTarget, setUpdateTarget] = useState<PaymentOption | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoading(id);
    try {
      await togglePaymentOption(id, !currentState);
      router.refresh();
    } catch {
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
      setShowAddDialog(false);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await deletePaymentOption(deleteTarget.id);
      router.refresh();
      toast({ title: 'Payment method deleted' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to delete payment method' });
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button className="gap-1.5" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox disabled />
              </TableHead>
              <TableHead>PAYMENT METHOD</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((option) => (
              <TableRow key={option.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">
                  {option.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={option.isActive ? 'default' : 'destructive'}
                    className={
                      option.isActive
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }
                  >
                    {option.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setUpdateTarget(option)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(option)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {options.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No payment methods found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the payment method &quot;{paymentLabels[deleteTarget?.name ?? ''] || deleteTarget?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update (Toggle) Dialog */}
      <AlertDialog open={!!updateTarget} onOpenChange={() => setUpdateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Toggle the status of &quot;{paymentLabels[updateTarget?.name ?? ''] || updateTarget?.name}&quot; from{' '}
              <strong>{updateTarget?.isActive ? 'Active' : 'Inactive'}</strong> to{' '}
              <strong>{updateTarget?.isActive ? 'Inactive' : 'Active'}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading === updateTarget?.id}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (updateTarget) {
                  await handleToggle(updateTarget.id, updateTarget.isActive);
                  setUpdateTarget(null);
                }
              }}
              disabled={loading === updateTarget?.id}
            >
              {loading === updateTarget?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add New Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g. BANK_TRANSFER"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setNewName(''); }}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
