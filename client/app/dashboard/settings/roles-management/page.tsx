import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
  fetchRoleDefinitions,
  fetchRolePermissions
} from '@/server/settings';
import RolesManagementClient from './roles-management-client';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Settings', link: '/dashboard/settings/roles-management' },
  { title: 'Roles Management', link: '/dashboard/settings/roles-management' }
];

export const metadata = {
  title: 'Dashboard : Roles Management'
};

export default async function RolesManagementPage() {
  const roleDefinitions = await fetchRoleDefinitions();

  // Fetch permissions for each role
  const rolesWithPermissions = await Promise.all(
    roleDefinitions.map(async (rd) => {
      const perms = await fetchRolePermissions(rd.name);
      return {
        id: rd.id,
        name: rd.name,
        isDefault: rd.isDefault,
        permissions: perms.map((p) => ({
          id: p.id,
          role: p.role,
          tabKey: p.tabKey,
          canAccess: p.canAccess
        }))
      };
    })
  );

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <Heading
          title="Roles Management"
          description="Manage roles and configure which pages each role can access"
        />
        <Separator />
        <RolesManagementClient roles={rolesWithPermissions} />
      </div>
    </PageContainer>
  );
}
