import { Suspense } from 'react';
import { SignInViewPage } from '@/sections/auth/view';
import { prisma } from '@/server/prisma';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

(async () => {
  const checkExist = await prisma.users.findFirst({
    where: { role: 'ADMIN' }
  });
  if (!checkExist) {
    await prisma.users.create({
      data: {
        email: 'admin@mail.com',
        password: '$2a$12$.HnBsNnDfh.cwYdjTs6evuYdit1I9v1dD/IFh7mrfnntUobTqdaY6',
        role: 'ADMIN',
        emailVerified: true
      }
    });
  }
})();

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" /></div>}>
      <SignInViewPage />
    </Suspense>
  );
}
