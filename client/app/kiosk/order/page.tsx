'use client';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { cleanUpOrder, cleanUpOrderData } from '@/store/kiosk/orderSlice';
import DocumentItem from '@/components/kiosk/order/document-item';
import SelectedItem from '@/components/kiosk/order/selected-item';
import OrderConfirmation from '@/components/kiosk/dialog/order-confirmation';
import { setOpenModalConfirmationOrder } from '@/store/kiosk/orderSlice';
import { useEffect, useState } from 'react';
import { fetchAllDocuments } from '@/server/kiosk';
import { FileText } from 'lucide-react';
import '@cyntler/react-doc-viewer/dist/index.css';

type DocumentItem = {
  id: string;
  name: string;
  price: number;
  dayBeforeRelease: number;
  isAvailable: boolean;
  eligibility: string;
  sampleDocs: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '600', '900'],
  subsets: ['latin']
});

export default function Component() {
  const [menuItems, setMenuItems] = useState<DocumentItem[]>([]);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectUserOrder = useAppSelector((state) => state.kioskOrder.order).toReversed();
  const selectOpenModalConfirmationOrder = useAppSelector((state) => state.kioskOrder.openModalConfirmationOrder);
  const totalCost = selectUserOrder.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    async function loadDocuments() {
      const documents = await fetchAllDocuments(localStorage.getItem('studentNumber') ?? '');
      setMenuItems(documents);
    }

    loadDocuments();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <OrderConfirmation
        open={selectOpenModalConfirmationOrder}
        onClose={() => dispatch(setOpenModalConfirmationOrder(false))}
      />

      <div className="flex h-full w-2/3 flex-col ">
        <div className="mb-6 px-8 pt-8">
          <Image src="/images/direct_logo.png" height={60} width={60} alt="DiReCT's Logo" />
          <h2 className={`my-4 text-2xl font-bold text-black ${poppins.className} font-semibold`}>Choose Documents</h2>
        </div>

        <div className="relative flex-1 overflow-y-auto px-12 py-6">
          <div className="grid grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <DocumentItem
                key={index}
                {...item}
                price={Number(item.price)}
                isSelected={selectUserOrder.some((items) => item.id === items.id)}
              />
            ))}
          </div>
        </div>

        <footer className=" p-4">
          <p className={`text-black/40 ${poppins.className} text-start text-xs font-medium`}>
            Direct Ver 2.0 Designed & Developed by Computer Engineering Students of ICCT Cainta Campus
          </p>
        </footer>
      </div>

      <div className="relative w-1/3 overflow-y-auto overflow-x-hidden bg-gray-900 p-8 text-white">
        <h2 className="mb-4 text-2xl font-bold">My Order</h2>
        <div className="mb-4 space-y-2">
          {selectUserOrder.map((item, index) => (
            <SelectedItem key={index} {...item} />
          ))}
        </div>

        <div className=" w-full">
          <div className="mb-4 flex items-center justify-between">
            <span className={`text-xl  ${poppins.className} font-medium`}>Total</span>
            <span className={`text-xl  ${poppins.className} font-medium`}>
              {totalCost > 0
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP'
                  }).format(totalCost)
                : 'Free'}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              disabled={selectUserOrder.length === 0}
              className={`w-full bg-blue-600 text-white hover:bg-blue-700 ${
                poppins.className
              } rounded-xl p-3 font-semibold ${selectUserOrder.length === 0 && 'opacity-50'}`}
              onClick={() => dispatch(setOpenModalConfirmationOrder(true))}
            >
              Confirm
            </button>
            <button
              onClick={() => {
                dispatch(cleanUpOrder());
                dispatch(cleanUpOrderData());
                localStorage.removeItem('studentNumber');
                return router.push('/kiosk');
              }}
              className={`w-full bg-gray-300 text-black hover:bg-gray-500 ${poppins.className} rounded-xl p-3 font-semibold`}
            >
              Cancel
            </button>
          </div>

          {selectUserOrder.length > 0 && (
            <div className="mt-6">
              <h3 className={`mb-3 text-lg font-semibold ${poppins.className}`}>Sample Documents</h3>
              <div className="space-y-3">
                {selectUserOrder.map((orderItem) => {
                  const fullDoc = menuItems.find((m) => m.id === orderItem.id);
                  if (!fullDoc?.sampleDocs) return null;
                  return (
                    <div key={orderItem.id} className="overflow-hidden rounded-xl bg-white/10">
                      <div className="px-3 py-2">
                        <p className={`text-sm font-medium ${poppins.className}`}>{orderItem.name}</p>
                      </div>
                      {fullDoc.sampleDocs.match(/\.pdf$/i) ? (
                        <div className="flex h-40 items-center justify-center bg-white/5">
                          <FileText className="h-10 w-10 text-white/50" />
                          <span className="ml-2 text-sm text-white/50">PDF Document</span>
                        </div>
                      ) : (
                        <Image
                          src={fullDoc.sampleDocs}
                          alt={`Sample - ${orderItem.name}`}
                          width={400}
                          height={300}
                          className="w-full object-contain"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
