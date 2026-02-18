import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { fetchEmailTemplates } from '@/server/settings';
import EmailTemplatesClient from './email-templates-client';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Settings', link: '/dashboard/settings/email-templates' },
  { title: 'Email Templates', link: '/dashboard/settings/email-templates' }
];

export const metadata = {
  title: 'Dashboard : Email Templates'
};

export default async function EmailTemplatesPage() {
  const templates = await fetchEmailTemplates();

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading
            title="Email Templates"
            description="Configure email notifications sent to clients when order status changes"
          />
        </div>
        <Separator />
        <EmailTemplatesClient templates={templates} />
      </div>
    </PageContainer>
  );
}
