import { useAppDispatch } from '@/hooks/redux';
import { formatCurrency } from '@/lib/utils';
import { removeFromOrder } from '@/store/kiosk/orderSlice';
import { MenuItem } from '@/types';
import { X } from 'lucide-react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '600', '900'],
  subsets: ['latin']
});

export default function SelectedItem(item: MenuItem) {
  const dispatch = useAppDispatch();

  return (
    <div className="items-center justify-center rounded-2xl bg-blue-600 p-3">
      <div className="flex  justify-end">
        <button onClick={() => dispatch(removeFromOrder(item.id))}>
          <X className="rounded-full p-1 hover:bg-red-500" size={30} />
        </button>
      </div>
      <div className={`mb-5 flex flex-col items-center justify-center`}>
        <span className={`${poppins.className} text-lg font-semibold`}>{item.name}</span>
        {Number(item.price) > 0 && (
          <span className={` ${poppins.className}  font-medium text-white/70`}>{formatCurrency(item.price)}</span>
        )}
      </div>
    </div>
  );
}
