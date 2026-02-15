'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, FileText, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mobileGetTransactions } from '@/server/mobile-auth';

type Transaction = Awaited<ReturnType<typeof mobileGetTransactions>>[number];

export default function MobileDocumentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mobileGetTransactions().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const filtered = transactions.filter((tx) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      tx.documentPayment.referenceNumber.toLowerCase().includes(q) ||
      (tx.status || '').toLowerCase().includes(q) ||
      tx.DocumentSelected.some((ds) =>
        ds.document.name.toLowerCase().includes(q)
      )
    );
  });

  return (
    <div className="px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Documents</h1>
        <Link
          href="/mobile/request"
          className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow"
        >
          <Plus className="h-3.5 w-3.5" /> Request
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by reference, status, or document..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 rounded-lg bg-muted/50 pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <FileText className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {search ? 'No results found' : 'No documents yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => (
            <Link
              key={tx.id}
              href={`/mobile/transaction/${tx.id}`}
              className="block rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {tx.documentPayment.referenceNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {tx.DocumentSelected.map((d) => d.document.name).join(', ')}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <StatusBadge status={tx.status} />
              </div>
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
