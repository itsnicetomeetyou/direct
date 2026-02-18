import { DocumentViewPage } from '@/sections/documents/views';
import { fetchDocumentById } from '@/server/document';

export const metadata = {
  title: 'Dashboard : Document View'
};

export default async function Page({ params }: { params: { documentId: string } }) {
  const documentId = params.documentId;
  if (documentId === 'new') {
    return <DocumentViewPage />;
  }
  try {
    const data = await fetchDocumentById(documentId);
    return <DocumentViewPage {...data} />;
  } catch (error) {
    return <div>Error loading document.</div>;
  }
}
