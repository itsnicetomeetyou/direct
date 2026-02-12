import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { removeFromOrder, setOpenModalConfirmationOrder } from '@/store/kiosk/orderSlice';
import { X } from 'lucide-react';
import { Poppins } from 'next/font/google';
import React, { useEffect } from 'react';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '900'],
  subsets: ['latin']
});

export default function YourOrder() {
  const dispatch = useAppDispatch();
  const selectUserOder = useAppSelector((state) => state.kioskOrder.order);

  useEffect(() => {
    if (!selectUserOder.length) {
      dispatch(setOpenModalConfirmationOrder(false));
    }
  }, [selectUserOder, dispatch]);

  return (
    <>
      <div className="mb-12 mt-4">
        <h3 className="text-lg font-semibold">Your Order</h3>
        <p className={`mb-4 text-sm text-black/30 ${poppins.className} font-medium`}>
          Please verify your order before you proceed
        </p>
      </div>
      <div className="h-[50vh] space-y-2 overflow-y-auto overflow-x-hidden p-5">
        {selectUserOder.toReversed().map((item, index) => (
          <div key={index} className="relative flex flex-col justify-between rounded-lg bg-blue-50 px-8 py-4">
            <button
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5"
              onClick={() => {
                dispatch(removeFromOrder(item.id));
              }}
            >
              <X className="h-5 w-5" color="#fff" />
            </button>
            <span className={`${poppins.className} text-sm font-semibold`}>{item.name}</span>
            <span className={`${poppins.className} text-sm font-medium opacity-60`}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP'
              }).format(item.price)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
