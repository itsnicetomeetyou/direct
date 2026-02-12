import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { seedPaymentOptions } from '@/server/settings';
import PaymentOptionsClient from './payment-options-client';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Settings', link: '/dashboard/settings/payment-options' },
  { title: 'Payment Options', link: '/dashboard/settings/payment-options' }
];

export const metadata = {
  title: 'Dashboard : Payment Options'
};

export default async function PaymentOptionsPage() {
  // Seed defaults if empty, then fetch
  const options = await seedPaymentOptions();
  const activeCount = options.filter((o) => o.isActive).length;

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="rounded-md border p-6">
          <Heading
            title="Payment Options"
            description="Manage payment methods availability for transactions"
          />
          <Separator className="my-4" />
          <PaymentOptionsClient options={options} />
          <p className="mt-4 text-sm text-muted-foreground">
            Toggle payment options on or off to control availability in
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
