import { redirect } from 'next/navigation';
import { getMobileSession, mobileGetProfile } from '@/server/mobile-auth';
import MobileLogoutButton from '@/components/mobile/logout-button';
import { User, Mail, GraduationCap, Phone, MapPin, Calendar } from 'lucide-react';

export default async function MobileProfilePage() {
  const session = await getMobileSession();
  if (!session) redirect('/mobile/login');

  const profile = await mobileGetProfile();
  if (!profile) redirect('/mobile/login');

  const info = profile.UserInformation;

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-6 text-xl font-bold">Profile</h1>

      {/* Avatar */}
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <User className="h-10 w-10 text-primary" />
        </div>
        {info ? (
          <h2 className="text-lg font-semibold">
            {info.firstName} {info.lastName}
          </h2>
        ) : (
          <h2 className="text-lg font-semibold">Student</h2>
        )}
        <p className="text-sm text-muted-foreground">{profile.email}</p>
      </div>

      {/* Info Cards */}
      <div className="space-y-3">
        <InfoCard icon={Mail} label="Email" value={profile.email} />
        <InfoCard
          icon={Calendar}
          label="Member Since"
          value={new Date(profile.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        />
        {info && (
          <>
            <InfoCard icon={GraduationCap} label="Student No." value={info.studentNo} />
            <InfoCard icon={Phone} label="Phone" value={info.phoneNo} />
            <InfoCard icon={MapPin} label="Address" value={info.address} />
          </>
        )}
      </div>

      {/* Logout */}
      <div className="mt-8">
        <MobileLogoutButton />
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
