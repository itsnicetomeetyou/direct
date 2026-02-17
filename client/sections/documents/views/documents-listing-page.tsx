import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Document } from '@/constants/data';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import DocumentsTable from '../documents-tables';
import { fetchDocuments } from '@/server/document';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Transactions List', link: '/dashboard/documents' }
];

type TDocumentListingPage = {};

export default async function DocumentsListingPage({}: TDocumentListingPage) {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('q');
  const pageLimit = searchParamsCache.get('limit');

  const {
    documents,
    totalDocuments
  }: {
    documents: Document[];
    totalDocuments: number;
  } = await fetchDocuments({ page, search, limit: pageLimit });

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title={`Order List (${totalDocuments})`} description="Manage Academic Document Order List" />

          <Link href={'/dashboard/documents/new'} className={cn(buttonVariants({ variant: 'default' }))}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />
        <DocumentsTable data={documents} totalData={totalDocuments} />
      </div>
    </PageContainer>
  );
}
