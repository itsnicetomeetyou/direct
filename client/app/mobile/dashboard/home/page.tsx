import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMobileSession, mobileGetStatistics, mobileGetTransactions } from '@/server/mobile-auth';
import { FileText, Clock, CheckCircle, XCircle, Loader, Plus } from 'lucide-react';

export default async function MobileHomePage() {
  const session = await getMobileSession();
  if (!session) redirect('/mobile/login');

  const [stats, transactions] = await Promise.all([
    mobileGetStatistics(),
    mobileGetTransactions(),
  ]);

  const recentTransactions = transactions.slice(0, 5);
  const firstName = session.UserInformation?.firstName || 'Student';

  const statCards = [
    { label: 'Completed', value: stats?.completed ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Processing', value: stats?.processing ?? 0, icon: Loader, color: 'text-blue-600 bg-blue-50' },
    { label: 'Cancelled', value: stats?.cancelled ?? 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Pending', value: stats?.pending ?? 0, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-xl font-bold">{firstName}</h1>
        </div>
        <Link
          href="/mobile/request"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent Transactions</h2>
        <Link href="/mobile/dashboard/documents" className="text-xs font-medium text-primary hover:underline">
          View All
        </Link>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentTransactions.map((tx) => (
            <Link
              key={tx.id}
              href={`/mobile/transaction/${tx.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {tx.documentPayment.referenceNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx.DocumentSelected.length} document{tx.DocumentSelected.length !== 1 ? 's' : ''} &middot;{' '}
                  {new Date(tx.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={tx.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    PAID: 'bg-green-50 text-green-700 border-green-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    READYTOPICKUP: 'bg-purple-50 text-purple-700 border-purple-200',
    OUTFORDELIVERY: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  };
  const label = status?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown';
  return (
    <span className={`ml-2 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${styles[status || ''] || 'bg-muted text-muted-foreground'}`}>
      {label}
    </span>
  );
}
