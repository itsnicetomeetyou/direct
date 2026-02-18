import { redirect } from 'next/navigation';
import { getMobileSession, mobileGetTransaction } from '@/server/mobile-auth';
import { ChevronLeft, FileText, Truck, CreditCard, Calendar, Hash, Check, X } from 'lucide-react';
import Link from 'next/link';
import MobileCancelButton from '@/components/mobile/cancel-button';

function getTrackingSteps(deliverOptions: string) {
  if (deliverOptions === 'PICKUP') {
    return [
      { key: 'PENDING', label: 'Pending' },
      { key: 'PAID', label: 'Paid' },
      { key: 'PROCESSING', label: 'Processing' },
      { key: 'READYTOPICKUP', label: 'Ready to Pick Up' },
      { key: 'COMPLETED', label: 'Completed' },
    ];
  }
  return [
    { key: 'PENDING', label: 'Pending' },
    { key: 'PAID', label: 'Paid' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'OUTFORDELIVERY', label: 'Out for Delivery' },
    { key: 'COMPLETED', label: 'Completed' },
  ];
}

function TrackingProgress({
  status,
  deliverOptions,
}: {
  status: string;
  deliverOptions: string;
}) {
  const isCancelled = status === 'CANCELLED';
  const steps = getTrackingSteps(deliverOptions);
  const currentIndex = isCancelled ? -1 : steps.findIndex((s) => s.key === status);

  if (isCancelled) {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
          <X className="h-5 w-5 text-white" />
        </div>
        <p className="text-sm font-semibold text-red-700">Order Cancelled</p>
        <p className="text-xs text-red-500">This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Order Progress
      </p>
      <div className="flex items-start justify-between px-1">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-1.5 max-w-[56px] text-center text-[9px] font-medium leading-tight ${
                    isCompleted ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className="mx-0.5 mb-5 h-0.5 flex-1">
                  <div
                    className={`h-full rounded-full ${
                      index < currentIndex ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

      {/* Tracking Progress */}
      <TrackingProgress
        status={tx.status ?? 'PENDING'}
        deliverOptions={tx.deliverOptions ?? 'PICKUP'}
      />

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
