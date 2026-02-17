import '@cyntler/react-doc-viewer/dist/index.css';
import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/toaster';
import '@uploadthing/react/styles.css';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { Inter } from 'next/font/google';
import { auth } from '@/auth';
import StoreProvider from './store-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DiReCT: Digital Record and Credential Transaction',
  description: 'Digital Record and Credential Transaction',
  creator: 'Computer Engineering Students of ICCT Cainta Campus',
  authors: [
    {
      name: 'Computer Engineering Students of ICCT Cainta Campus'
    }
  ]
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} overflow-hidden `} suppressHydrationWarning={true}>
        <StoreProvider>
          <NextTopLoader showSpinner={false} />
          <Providers session={session}>
            <Toaster />
            {children}
          </Providers>
        </StoreProvider>
      </body>
    </html>
  );
}
