import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { fetchPaymentOptions } from '@/server/settings';
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
  const options = await fetchPaymentOptions();

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading
            title="Payment Options"
            description="Manage payment methods availability for transactions"
          />
        </div>
        <Separator />
        <PaymentOptionsClient options={options} />
      </div>
    </PageContainer>
  );
}
