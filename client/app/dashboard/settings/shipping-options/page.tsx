import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { fetchShippingOptions, seedShippingOptions } from '@/server/settings';
import ShippingOptionsClient from './shipping-options-client';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Settings', link: '/dashboard/settings/shipping-options' },
  { title: 'Shipping Options', link: '/dashboard/settings/shipping-options' }
];

export const metadata = {
  title: 'Dashboard : Shipping Options'
};

export default async function ShippingOptionsPage() {
  const options = await seedShippingOptions();
  const activeCount = options.filter((o) => o.isActive).length;

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="rounded-md border p-6">
          <Heading
            title="Shipping Options"
            description="Manage delivery methods availability for transactions"
          />
          <Separator className="my-4" />
          <ShippingOptionsClient options={options} />
          <p className="mt-4 text-sm text-muted-foreground">
            Toggle shipping options on or off to control availability in
            transactions.
          </p>
          <p className="text-sm text-muted-foreground">
            Active options: {activeCount} of {options.length}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
