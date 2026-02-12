import { searchParamsCache } from '@/lib/searchparams';
import DocumentsListingPage from '@/sections/documents/views/documents-listing-page';
import { SearchParams } from 'nuqs/parsers';

type pageProps = {
  searchParams: SearchParams;
};

export const metadata = {
  title: 'Dashboard : Documents'
};

export default async function Page({ searchParams }: pageProps) {
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  return <DocumentsListingPage />;
}
