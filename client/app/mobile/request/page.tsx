'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  ChevronLeft,
  Check,
  FileText,
  CalendarIcon,
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
} from 'lucide-react';
import {
  mobileGetDocuments,
  mobileGetDeliveryOptions,
  mobileGetPaymentOptions,
  mobileGetScheduleConfig,
  mobileGetHolidays,
  mobileCheckSchedule,
  mobileSubmitRequest,
} from '@/server/mobile-auth';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

type DocItem = { id: string; name: string; price: any; dayBeforeRelease: number };
type ScheduleConfig = { maxSlotsPerDay: number; minDaysAdvance: number };
type HolidayItem = { date: string; name: string | null };

export default function MobileRequestPage() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<string[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<string[]>([]);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    maxSlotsPerDay: 300,
    minDaysAdvance: 0,
  });
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [deliveryOption, setDeliveryOption] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const [schedule, setSchedule] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState<{
    count: number;
    disabled: boolean;
  } | null>(null);
  const [address, setAddress] = useState('');
  const [additionalAddress, setAdditionalAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [checkingSchedule, setCheckingSchedule] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      mobileGetDocuments(),
      mobileGetDeliveryOptions(),
      mobileGetPaymentOptions(),
      mobileGetScheduleConfig(),
      mobileGetHolidays(),
    ]).then(([docs, deliveryOpts, paymentOpts, config, hols]) => {
      setDocuments(
        docs.map((d: any) => ({
          id: d.id,
          name: d.name,
          price: d.price,
          dayBeforeRelease: d.dayBeforeRelease ?? 3,
        }))
      );
      setDeliveryOptions(deliveryOpts);
      setPaymentOptions(paymentOpts);
      setScheduleConfig(config);
      setHolidays(hols);
      if (deliveryOpts.length > 0) setDeliveryOption(deliveryOpts[0]);
      if (paymentOpts.length > 0) setPaymentOption(paymentOpts[0]);
      setLoadingData(false);
    });
  }, []);

  useEffect(() => {
    if (!schedule) {
      setScheduleStatus(null);
      return;
    }
    setCheckingSchedule(true);
    mobileCheckSchedule(schedule).then((result) => {
      setScheduleStatus(result);
      setCheckingSchedule(false);
    });
  }, [schedule]);

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const totalFees = documents
    .filter((d) => selectedDocs.includes(d.id))
    .reduce((sum, d) => sum + Number(d.price), 0);

  const minDaysAdvance = useMemo(() => {
    const selected = documents.filter((d) => selectedDocs.includes(d.id));
    if (selected.length === 0) return 3;
    return Math.max(...selected.map((d) => d.dayBeforeRelease));
  }, [documents, selectedDocs]);

  const minDate = useMemo(() => {
    let daysToAdd = minDaysAdvance;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    while (daysToAdd > 0) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0) daysToAdd--;
    }
    return moment(date).format('YYYY-MM-DD');
  }, [minDaysAdvance]);

  const isDateDisabled = (dateStr: string) => {
    const d = moment(dateStr);
    if (d.day() === 0) return 'Sundays are not available';
    const holiday = holidays.find((h) => h.date === dateStr);
    if (holiday) return `Holiday: ${holiday.name || 'Closed'}`;
    return null;
  };

  const handleSubmit = async () => {
    if (selectedDocs.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select at least one document.' });
      return;
    }
    if (!deliveryOption) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a delivery option.' });
      return;
    }
    if (!paymentOption) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a payment method.' });
      return;
    }

    if (!schedule) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a schedule.' });
      return;
    }
    const dateIssue = isDateDisabled(schedule);
    if (dateIssue) {
      toast({ variant: 'destructive', title: 'Error', description: dateIssue });
      return;
    }
    if (scheduleStatus?.disabled) {
      toast({ variant: 'destructive', title: 'Error', description: 'Selected date is full. Please choose another date.' });
      return;
    }

    if (deliveryOption === 'LALAMOVE') {
      if (!address.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter your delivery address.' });
        return;
      }
      if (!additionalAddress.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter additional address details.' });
        return;
      }
    }

    setLoading(true);
    try {
      const result = await mobileSubmitRequest({
        documentIds: selectedDocs,
        deliveryOption,
        paymentOption,
        schedule: schedule || undefined,
        address: deliveryOption !== 'PICKUP' ? address : undefined,
        additionalAddress: deliveryOption !== 'PICKUP' ? additionalAddress : undefined,
      });
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        return;
      }
      if (result.success) {
        toast({
          title: 'Request Submitted',
          description: `Reference: ${result.referenceNumber}. A confirmation email has been sent.`,
        });
        router.push('/mobile/dashboard/documents');
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit request.' });
    } finally {
      setLoading(false);
    }
  };

  const formatPaymentLabel = (opt: string) => {
    const labels: Record<string, string> = {
      GCASH: 'GCash', PAYMAYA: 'PayMaya', PAYPAL: 'PayPal',
      CREDITCARD: 'Credit Card', WALKIN: 'Walk-in',
      PORTAL_GENERATED: 'Portal', ATTACHED_FILE: 'Attached File',
    };
    return labels[opt] || opt;
  };

  const formatDeliveryLabel = (opt: string) => {
    const labels: Record<string, string> = { PICKUP: 'Pick Up', LALAMOVE: 'Delivery (Lalamove)' };
    return labels[opt] || opt;
  };

  if (loadingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stepNum = (() => {
    let n = 3;
    return {
      schedule: n,
      address: deliveryOption !== 'PICKUP' ? ++n : n,
      payment: ++n,
    };
  })();

  return (
    <div className="h-full overflow-y-auto bg-background px-4 pb-8 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-bold">Request Document</h1>
      </div>

      {/* Step 1: Document Selection */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">1</div>
          <h2 className="text-sm font-semibold text-muted-foreground">Select Documents</h2>
        </div>
        <div className="space-y-2">
          {documents.length === 0 ? (
            <p className="rounded-xl border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              No documents available for your eligibility.
            </p>
          ) : (
            documents.map((doc) => {
              const selected = selectedDocs.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                    selected ? 'border-primary bg-primary/5' : 'bg-card hover:border-primary/30'
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    selected ? 'bg-primary text-white' : 'bg-muted'
                  }`}>
                    {selected ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <div className="flex items-center gap-2">
                      {Number(doc.price) > 0 && (
                        <p className="text-xs text-muted-foreground">PHP {Number(doc.price).toFixed(2)}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">• Min {doc.dayBeforeRelease} days advance</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Step 2: Delivery Option */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">2</div>
          <h2 className="text-sm font-semibold text-muted-foreground">Delivery Option</h2>
        </div>
        <div className="flex gap-2">
          {deliveryOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setDeliveryOption(opt);
                if (opt !== 'PICKUP') setSchedule('');
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-center text-sm font-medium transition ${
                deliveryOption === opt ? 'border-primary bg-primary text-white' : 'bg-card hover:border-primary/30'
              }`}
            >
              {opt === 'PICKUP' ? <ShoppingBag className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
              {formatDeliveryLabel(opt)}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Schedule (always shown) */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">3</div>
          <h2 className="text-sm font-semibold text-muted-foreground">Schedule</h2>
        </div>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            value={schedule}
            min={minDate}
            onChange={(e) => setSchedule(e.target.value)}
            className="h-11 rounded-xl bg-card pl-10"
          />
        </div>
        {schedule && (
          <div className="mt-2">
            {checkingSchedule ? (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
              </p>
            ) : scheduleStatus?.disabled ? (
              <p className="text-xs font-medium text-destructive">
                This date is full ({scheduleStatus.count}/{scheduleConfig.maxSlotsPerDay} slots). Please choose another date.
              </p>
            ) : isDateDisabled(schedule) ? (
              <p className="text-xs font-medium text-destructive">{isDateDisabled(schedule)}</p>
            ) : (
              <p className="text-xs text-green-600">
                Available ({scheduleStatus?.count || 0}/{scheduleConfig.maxSlotsPerDay} slots used)
              </p>
            )}
          </div>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Must be at least {minDaysAdvance} business days in advance. Sundays and holidays are not available.
        </p>
      </div>

      {/* Step 4: Address (LALAMOVE only) */}
      {deliveryOption !== 'PICKUP' && deliveryOption !== '' && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">4</div>
            <h2 className="text-sm font-semibold text-muted-foreground">Delivery Address</h2>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-11 rounded-xl bg-card pl-10"
              />
            </div>
            <Input
              placeholder="Additional Address Details (Landmark, etc.)"
              value={additionalAddress}
              onChange={(e) => setAdditionalAddress(e.target.value)}
              className="h-11 rounded-xl bg-card"
            />
          </div>
        </div>
      )}

      {/* Step 5: Payment Method */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {deliveryOption !== 'PICKUP' && deliveryOption !== '' ? '5' : '4'}
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground">Payment Method</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {paymentOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setPaymentOption(opt)}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-center text-sm font-medium transition ${
                paymentOption === opt ? 'border-primary bg-primary text-white' : 'bg-card hover:border-primary/30'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              {formatPaymentLabel(opt)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {selectedDocs.length > 0 && (
        <div className="mb-6 rounded-xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Order Summary</h3>
          <div className="space-y-1">
            {documents
              .filter((d) => selectedDocs.includes(d.id))
              .map((doc) => (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{doc.name}</span>
                  {Number(doc.price) > 0 && <span>PHP {Number(doc.price).toFixed(2)}</span>}
                </div>
              ))}
          </div>
          <div className="mt-3 border-t pt-3">
            {totalFees > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Document Fees</span>
                <span className="font-semibold">PHP {totalFees.toFixed(2)}</span>
              </div>
            )}
            {deliveryOption !== 'PICKUP' && deliveryOption !== '' && (
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fees</span>
                <span className="text-xs text-muted-foreground">Calculated upon processing</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-base font-bold text-primary">
                {totalFees > 0 ? `PHP ${totalFees.toFixed(2)}` : 'Free'}
                {deliveryOption !== 'PICKUP' && deliveryOption !== '' ? ' + Delivery' : ''}
              </span>
            </div>
          </div>
          {deliveryOption && (
            <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
              <p>
                Delivery: {formatDeliveryLabel(deliveryOption)}
                {schedule ? ` | Schedule: ${moment(schedule).format('MMM D, YYYY')}` : ''}
              </p>
              <p>Payment: {formatPaymentLabel(paymentOption)}</p>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <Button
        className="h-12 w-full rounded-xl text-sm font-semibold"
        onClick={handleSubmit}
        disabled={loading || selectedDocs.length === 0}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit Request
      </Button>
    </div>
  );
}
