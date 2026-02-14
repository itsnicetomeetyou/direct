'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';

import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  toggleRolePermission,
  createRoleDefinition,
  deleteRoleDefinition
} from '@/server/settings';

interface Permission {
  id: string;
  role: string;
  tabKey: string;
  canAccess: boolean;
}

interface RoleWithPermissions {
  id: string;
  name: string;
  isDefault: boolean;
  permissions: Permission[];
}

const TAB_DISPLAY: Record<string, { label: string; description: string }> = {
  Dashboard: {
    label: 'Dashboard',
    description: 'Overview page with statistics and charts'
  },
  transaction: {
    label: 'Transaction',
    description: 'Manage academic document types and pricing'
  },
  'transaction-list': {
    label: 'Transaction List',
    description: 'View and manage student document requests'
  },
  settings: {
    label: 'Settings Menu',
    description: 'Access to the Settings section in sidebar'
  },
  'payment-options': {
    label: 'Payment Options',
    description: 'Configure available payment methods'
  },
  'shipping-options': {
    label: 'Shipping Options',
    description: 'Configure available delivery methods'
  },
  'schedule-options': {
    label: 'Schedule Options',
    description: 'Configure scheduling limits and holidays'
  },
  'user-management': {
    label: 'User Management',
    description: 'Manage user accounts and roles'
  },
  'order-status': {
    label: 'Order Status',
    description: 'Configure available order statuses'
  },
  'roles-management': {
    label: 'Roles Management',
    description: 'Configure role permissions (this page)'
  }
};

function RolePermissionCard({
  role,
  onDelete
}: {
  role: RoleWithPermissions;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoading(id);
    try {
      await toggleRolePermission(id, !currentState);
      router.refresh();
    } catch {
      // silently handle
    } finally {
      setLoading(null);
    }
  };

  const activeCount = role.permissions.filter((p) => p.canAccess).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="flex items-center gap-2">
                {role.name}
                {role.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {activeCount} of {role.permissions.length} pages accessible
              </CardDescription>
            </div>
          </div>
          {!role.isDefault && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {role.permissions.map((perm) => {
            const display = TAB_DISPLAY[perm.tabKey] || {
              label: perm.tabKey,
              description: ''
            };
            return (
              <div
                key={perm.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{display.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {display.description}
                  </p>
                </div>
                <Switch
                  checked={perm.canAccess}
                  disabled={loading === perm.id}
                  onCheckedChange={() =>
                    handleToggle(perm.id, perm.canAccess)
                  }
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function RolesManagementClient({
  roles
}: {
  roles: RoleWithPermissions[];
}) {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoleWithPermissions | null>(
    null
  );
  const [newRoleName, setNewRoleName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    setSubmitting(true);
    try {
      await createRoleDefinition(newRoleName.trim());
      setNewRoleName('');
      setAddDialogOpen(false);
      router.refresh();
    } catch {
      // silently handle
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteRoleDefinition(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteDialogOpen(false);
      router.refresh();
    } catch {
      // silently handle
    } finally {
      setSubmitting(false);
    }
  };

  const defaultTab = roles.length > 0 ? roles[0].name : '';

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
              <DialogDescription>
                Enter a name for the new role. It will be stored in uppercase
                with underscores (e.g. &quot;Staff Member&quot; becomes
                &quot;STAFF_MEMBER&quot;). The new role starts with no page
                access &mdash; configure permissions after creating it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Input
                placeholder="e.g. Staff Member"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
              />
              {newRoleName.trim() && (
                <p className="text-xs text-muted-foreground">
                  Will be stored as:{' '}
                  <span className="font-mono font-semibold">
                    {newRoleName.toUpperCase().replace(/\s+/g, '_')}
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
                onClick={handleAddRole}
                disabled={!newRoleName.trim() || submitting}
              >
                {submitting ? 'Adding...' : 'Add Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="flex-wrap">
          {roles.map((role) => (
            <TabsTrigger key={role.name} value={role.name} className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              {role.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {roles.map((role) => (
          <TabsContent key={role.name} value={role.name}>
            <RolePermissionCard
              role={role}
              onDelete={
                role.isDefault
                  ? undefined
                  : () => {
                      setDeleteTarget(role);
                      setDeleteDialogOpen(true);
                    }
              }
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role &quot;
              {deleteTarget?.name}&quot;? All permissions for this role will be
              removed, and any users assigned to this role will be reset to
              STUDENT. This action cannot be undone.
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
              onClick={handleDeleteRole}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
