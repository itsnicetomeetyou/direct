import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { fetchRolePermissions } from '@/server/settings';
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
  const adminPerms = await fetchRolePermissions('ADMIN');
  const studentPerms = await fetchRolePermissions('STUDENT');

  const serializePerms = (perms: typeof adminPerms) =>
    perms.map((p) => ({
      id: p.id,
      role: p.role,
      tabKey: p.tabKey,
      canAccess: p.canAccess
    }));

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <Heading
          title="Roles Management"
          description="Configure which pages and features each role can access"
        />
        <Separator />
        <RolesManagementClient
          adminPermissions={serializePerms(adminPerms)}
          studentPermissions={serializePerms(studentPerms)}
        />
      </div>
    </PageContainer>
  );
}
