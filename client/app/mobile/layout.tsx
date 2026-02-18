import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'DiReCT Mobile',
  description: 'Digital Record and Credential Transaction - Mobile',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-y-auto bg-background">
      {children}
    </div>
  );
}
