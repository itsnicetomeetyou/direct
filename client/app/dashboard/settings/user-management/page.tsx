import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { fetchUsers } from '@/server/users';
import UserManagementClient from './user-management-client';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Settings', link: '/dashboard/settings/user-management' },
  { title: 'User Management', link: '/dashboard/settings/user-management' }
];

export const metadata = {
  title: 'Dashboard : User Management'
};

export default async function UserManagementPage({
  searchParams
}: {
  searchParams: { page?: string; q?: string; role?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.q || null;
  const role = searchParams.role || null;
  const limit = 10;

  const { users, totalUsers } = await fetchUsers({ page, limit, search, role });

  const serializedUsers = users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt.toISOString(),
    firstName: u.UserInformation?.firstName || '',
    lastName: u.UserInformation?.lastName || '',
    middleName: u.UserInformation?.middleName || '',
    studentNo: u.UserInformation?.studentNo || '',
    lrn: u.UserInformation?.lrn || '',
    address: u.UserInformation?.address || '',
    phoneNo: u.UserInformation?.phoneNo || ''
  }));

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading
            title={`User Management (${totalUsers})`}
            description="Manage user accounts, roles, and permissions"
          />
        </div>
        <Separator />
        <UserManagementClient
          users={serializedUsers}
          totalUsers={totalUsers}
          currentPage={page}
          pageSize={limit}
        />
      </div>
    </PageContainer>
  );
}
