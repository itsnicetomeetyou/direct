import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { TDocumentRequest } from '@/constants/data';
import { searchParamsCache } from '@/lib/searchparams';
import { fetchDocumentRequest } from '@/server/document';
import RequestTable from '../documents-tables';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Request', link: '/dashboard/request' }
];

export default async function RequestsListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('q');
  const pageLimit = searchParamsCache.get('limit');
  const status = searchParamsCache.get('status');

  const { documentsRequest, totalDocumentsRequest } = await fetchDocumentRequest({
    page,
    search,
    limit: pageLimit,
    status: status
  });

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Order List (${totalDocumentsRequest})`}
            description="Manage student academic document order list"
          />
        </div>
        <Separator />
        <RequestTable data={documentsRequest as TDocumentRequest[]} totalData={totalDocumentsRequest} />
      </div>
    </PageContainer>
  );
}
