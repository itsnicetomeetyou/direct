'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setOrderDataShippingOptions } from '@/store/kiosk/orderSlice';
import { DeliveryOptions } from '@prisma/client';
import { Loader2, Package, ShoppingBag, Truck } from 'lucide-react';
import { Poppins } from 'next/font/google';
import { fetchActiveDeliveryOptions } from '@/server/kiosk';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '900'],
  subsets: ['latin']
});

const deliveryLabels: Record<string, string> = {
  PICKUP: 'Pick Up',
  LALAMOVE: 'Delivery',
};

export default function ShippingOptions() {
  const dispatch = useAppDispatch();
  const selectOrderDataDeliveryOptions = useAppSelector((state) => state.kioskOrder.orderData.shippingOptions);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveDeliveryOptions().then((opts) => {
      setOptions(opts);
      setLoading(false);
    });
  }, []);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setOrderDataShippingOptions(event.target.value as DeliveryOptions | null));
  };

  return (
    <>
      <div className="mb-12 mt-4">
        <h3 className="text-lg font-semibold">Shipping Options</h3>
        <p className={`mb-4 text-sm text-black/30 ${poppins.className} font-medium`}>Please select logistic partner</p>
      </div>
      <div className="h-[50vh] space-y-2 overflow-y-auto overflow-x-hidden p-5">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : options.length === 0 ? (
          <p className={`text-center text-sm text-black/40 ${poppins.className}`}>No shipping options available.</p>
        ) : (
          options.map((item) => (
            <label
              key={item}
              className={`relative flex cursor-pointer flex-row items-center rounded-lg px-10 py-6 ${
                item === selectOrderDataDeliveryOptions
                  ? 'border border-blue-500 bg-blue-100'
                  : 'border border-black/5 bg-white'
              }`}
            >
              <input
                type="radio"
                name="shippingOption"
                value={item}
                checked={selectOrderDataDeliveryOptions === item}
                onChange={handleOptionChange}
                className="hidden"
              />
              {item === 'PICKUP' ? (
                <ShoppingBag size={35} className="mr-4 text-blue-500" />
              ) : (
                <Truck size={35} className="mr-4 text-blue-500" />
              )}
              <div className="flex flex-col gap-2">
                <span className={`${poppins.className} text-base font-semibold opacity-80`}>
                  {deliveryLabels[item] || item}
                </span>
              </div>
            </label>
          ))
        )}
      </div>
    </>
  );
}
