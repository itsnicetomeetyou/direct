import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { seedOrderStatuses } from '@/server/settings';
import OrderStatusClient from './order-status-client';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Settings', link: '/dashboard/settings/order-status' },
  { title: 'Order Status', link: '/dashboard/settings/order-status' }
];

export const metadata = {
  title: 'Dashboard : Order Status Settings'
};

export default async function OrderStatusPage() {
  const statuses = await seedOrderStatuses();
  const activeCount = statuses.filter((s) => s.isActive).length;

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="rounded-md border p-6">
          <Heading
            title="Order Status Settings"
            description="Manage which order statuses are available in the system"
          />
          <Separator className="my-4" />
          <OrderStatusClient statuses={statuses} />
          <p className="mt-4 text-sm text-muted-foreground">
            Toggle order statuses on or off to control which status transitions
            are available.
          </p>
          <p className="text-sm text-muted-foreground">
            Active statuses: {activeCount} of {statuses.length}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
