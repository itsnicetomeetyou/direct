'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toggleRolePermission } from '@/server/settings';

interface Permission {
  id: string;
  role: string;
  tabKey: string;
  canAccess: boolean;
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
  permissions,
  roleName,
  roleIcon
}: {
  permissions: Permission[];
  roleName: string;
  roleIcon: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoading(id);
    try {
      await toggleRolePermission(id, !currentState);
      toast.success('Permission updated');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update permission');
    } finally {
      setLoading(null);
    }
  };

  const activeCount = permissions.filter((p) => p.canAccess).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {roleIcon}
          <div>
            <CardTitle>{roleName}</CardTitle>
            <CardDescription>
              {activeCount} of {permissions.length} pages accessible
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {permissions.map((perm) => {
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
  adminPermissions,
  studentPermissions
}: {
  adminPermissions: Permission[];
  studentPermissions: Permission[];
}) {
  return (
    <Tabs defaultValue="admin" className="space-y-4">
      <TabsList>
        <TabsTrigger value="admin" className="gap-2">
          <ShieldCheck className="h-4 w-4" />
          Admin
        </TabsTrigger>
        <TabsTrigger value="student" className="gap-2">
          <ShieldAlert className="h-4 w-4" />
          Student
        </TabsTrigger>
      </TabsList>
      <TabsContent value="admin">
        <RolePermissionCard
          permissions={adminPermissions}
          roleName="Admin Role"
          roleIcon={<ShieldCheck className="h-5 w-5 text-primary" />}
        />
      </TabsContent>
      <TabsContent value="student">
        <RolePermissionCard
          permissions={studentPermissions}
          roleName="Student Role"
          roleIcon={<ShieldAlert className="h-5 w-5 text-orange-500" />}
        />
      </TabsContent>
    </Tabs>
  );
}
