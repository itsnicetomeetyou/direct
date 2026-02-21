import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getMobileSession } from '@/server/mobile-auth';

export default async function MobileWelcomePage() {
  const session = await getMobileSession();

  if (session) {
    if (!session.emailVerified) {
      redirect(`/mobile/verify-email?email=${session.email}`);
    }
    if (!session.UserInformation) {
      redirect('/mobile/register-info');
    }
    redirect('/mobile/dashboard/home');
  }

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto bg-gradient-to-br from-[#E900C4] to-[#007AEB] px-6">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Image src="/images/direct_logo.png" height={120} width={120} alt="DiReCT's Logo" className="mb-6" />

        <h1 className="mb-2 text-center text-4xl font-extrabold text-white">
          WELCOME TO DiReCT+
        </h1>
        <p className="text-center text-sm font-medium text-white/90">
          Digital Record and Credential Transaction
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3 pb-10">
        <Link
          href="/mobile/register"
          className="block w-full rounded-xl bg-white py-3.5 text-center text-sm font-semibold text-[#007AEB] shadow-lg transition hover:bg-white/90"
        >
          Register
        </Link>
        <Link
          href="/mobile/login"
          className="block w-full rounded-xl border-2 border-white py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Log In
        </Link>

        <p className="pt-4 text-center text-[10px] text-white/70">
          Direct Ver 2.0 Designed &amp; Developed by Computer Engineering Students of ICCT Cainta Campus
        </p>
      </div>
    </div>
  );
}
