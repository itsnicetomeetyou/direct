import { redirect } from 'next/navigation';
import { getMobileSession, mobileGetTransaction } from '@/server/mobile-auth';
import { ChevronLeft, FileText, Truck, CreditCard, Calendar, Hash } from 'lucide-react';
import Link from 'next/link';
import MobileCancelButton from '@/components/mobile/cancel-button';

export default async function MobileTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getMobileSession();
  if (!session) redirect('/mobile/login');

  const { id } = await params;
  const tx = await mobileGetTransaction(id);
  if (!tx) redirect('/mobile/dashboard/documents');

  const payment = tx.documentPayment;
  const docs = tx.DocumentSelected;
  const isPending = tx.status === 'PENDING';

  return (
    <div className="min-h-screen bg-background px-4 pb-8 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/mobile/dashboard/documents"
          className="flex h-9 w-9 items-center justify-center rounded-lg border"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">Transaction Details</h1>
      </div>

      {/* Status */}
      <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <StatusBadge status={tx.status} />
        </div>
      </div>

      {/* Documents */}
      <div className="mb-4">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Documents
        </h2>
        <div className="space-y-2">
          {docs.map((ds) => (
            <div
              key={ds.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{ds.document.name}</p>
                {Number(ds.document.price) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    PHP {Number(ds.document.price).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="mb-6 space-y-2">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Details
        </h2>
        <DetailRow
          icon={Hash}
          label="Reference"
          value={payment.referenceNumber}
        />
        <DetailRow
          icon={Truck}
          label="Delivery"
          value={tx.deliverOptions === 'PICKUP' ? 'Pick Up' : 'Delivery'}
        />
        <DetailRow
          icon={CreditCard}
          label="Payment"
          value={payment.paymentOptions || 'N/A'}
        />
        <DetailRow
          icon={Calendar}
          label="Date"
          value={new Date(tx.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        />
      </div>

      {/* Fees */}
      <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
        {Number(payment.documentFees ?? 0) > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Document Fees</span>
            <span>PHP {Number(payment.documentFees ?? 0).toFixed(2)}</span>
          </div>
        )}
        {payment.shippingFees != null && Number(payment.shippingFees) > 0 && (
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shipping Fees</span>
            <span>PHP {Number(payment.shippingFees).toFixed(2)}</span>
          </div>
        )}
        <div className="mt-2 border-t pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-base font-bold text-primary">
              {Number(payment.totalAmount ?? payment.documentFees ?? 0) > 0
                ? `PHP ${Number(payment.totalAmount ?? payment.documentFees ?? 0).toFixed(2)}`
                : 'Free'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isPending && (
        <MobileCancelButton orderId={tx.id} />
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
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status || ''] || 'bg-muted text-muted-foreground'}`}
    >
      {label}
    </span>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
