'use client';
import { useAppDispatch } from '@/hooks/redux';
import { formatCurrency } from '@/lib/utils';
import { addToOrder, removeFromOrder } from '@/store/kiosk/orderSlice';
import { DocumentItemProps } from '@/types';
import { X } from 'lucide-react';
import { Poppins } from 'next/font/google';
import React from 'react';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '600', '900'],
  subsets: ['latin']
});

export default function DocumentItem(item: DocumentItemProps) {
  const dispatch = useAppDispatch();
  if (item.isSelected) {
    return (
      <button
        key={item.id}
        className="relative rounded-2xl bg-blue-500"
        onClick={() => dispatch(removeFromOrder(item.id))}
      >
        <div className="absolute -right-2 -top-2 rounded-full bg-red-500 text-white hover:text-white">
          <X className="rounded-full p-1 hover:bg-red-500" size={30} />
        </div>
        <div className="flex h-full flex-col items-center justify-between p-4 py-10">
          <div className="text-center">
            <h3 className={`font-semibold text-white ${poppins.className} text-lg font-semibold`}>{item.name}</h3>
            <p className={`text-lg ${poppins.className} font-medium text-white opacity-70`}>
              {formatCurrency(item.price)}
            </p>
          </div>
        </div>
      </button>
    );
  }
  return (
    <button key={item.id} className="rounded-2xl bg-gray-200" onClick={() => dispatch(addToOrder(item))}>
      <div className="flex h-full flex-col items-center justify-between p-4 py-10">
        <div className="text-center">
          <h3 className={`font-semibold text-black ${poppins.className} text-lg font-semibold`}>{item.name}</h3>
          <p className={`text-lg ${poppins.className} font-medium opacity-60`}>{formatCurrency(item.price)}</p>
        </div>
      </div>
    </button>
  );
}
