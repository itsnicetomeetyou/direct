'use client';
import { useEffect, useState } from 'react';
import { Poppins } from 'next/font/google';
import { CreditCard, Loader2, PhilippinePeso } from 'lucide-react';
import { PaymentOptions } from '@prisma/client';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setOrderDataPaymentMethod } from '@/store/kiosk/orderSlice';
import { fetchActivePaymentOptions } from '@/server/kiosk';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '900'],
  subsets: ['latin']
});

const paymentLabels: Record<string, string> = {
  GCASH: 'GCash',
  PAYMAYA: 'PayMaya',
  PAYPAL: 'PayPal',
  CREDITCARD: 'Credit Card',
  WALKIN: 'Walk-in',
  PORTAL_GENERATED: 'Portal',
  ATTACHED_FILE: 'Attached File',
};

export default function PaymentMethod() {
  const dispatch = useAppDispatch();
  const selectOrderDataPaymentOptions = useAppSelector((state) => state.kioskOrder.orderData.paymentMethod);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePaymentOptions().then((opts) => {
      setOptions(opts);
      setLoading(false);
    });
  }, []);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setOrderDataPaymentMethod(event.target.value as PaymentOptions));
  };

  return (
    <>
      <div className="mb-12 mt-4">
        <h3 className="text-lg font-semibold">Payment Methods</h3>
        <p className={`mb-4 text-sm text-black/30 ${poppins.className} font-medium`}>Please select payment method</p>
      </div>
      <div className="h-[50vh] space-y-2 overflow-y-auto overflow-x-hidden p-5">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : options.length === 0 ? (
          <p className={`text-center text-sm text-black/40 ${poppins.className}`}>No payment methods available.</p>
        ) : (
          options.map((item) => (
            <label
              key={item}
              className={`relative flex cursor-pointer flex-row items-center rounded-lg px-10 py-6 ${
                item === selectOrderDataPaymentOptions
                  ? 'border border-blue-500 bg-blue-100'
                  : 'border border-black/5 bg-white'
              }`}
            >
              <input
                type="radio"
                name="paymentOption"
                value={item}
                checked={selectOrderDataPaymentOptions === item}
                onChange={handleOptionChange}
                className="hidden"
              />
              <CreditCard size={35} className="mr-4 text-blue-500" />
              <div className="flex flex-col gap-2">
                <span className={`${poppins.className} text-base font-semibold opacity-80`}>
                  {paymentLabels[item] || item}
                </span>
              </div>
            </label>
          ))
        )}
      </div>
    </>
  );
}
