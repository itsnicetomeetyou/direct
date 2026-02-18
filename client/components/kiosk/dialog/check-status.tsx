'use client';
import ViewMoreModal from '@/components/modal/view-more-modal';
import { TDocumentRequest } from '@/constants/data';
import { orderCheckStatus } from '@/server/kiosk';
import { Button, Dialog, DialogBackdrop, DialogPanel, DialogTitle, Input } from '@headlessui/react';
import { LoaderCircle } from 'lucide-react';
import { Poppins } from 'next/font/google';
import { useState } from 'react';
import Swal from 'sweetalert2';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '900'],
  subsets: ['latin']
});

export default function CheckStatus(props: {
  modal: { checkStatus: boolean; startTransaction: boolean };
  setModal: React.Dispatch<React.SetStateAction<{ checkStatus: boolean; startTransaction: boolean }>>;
}) {
  const [data, setData] = useState<TDocumentRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewTransactionModal, setViewTransactionModal] = useState<boolean>(false);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const onClickConfirm = async () => {
    try {
      setIsLoading(true);
      const response = await orderCheckStatus(referenceNumber);
      if (response === 'Invalid Reference Number') {
        setIsLoading(false);
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: response,
          customClass: {
            container: `${poppins.className}`,
            confirmButton: ` bg-red-500 text-white hover:bg-red-600 w-[100px] ${poppins.className} rounded-lg p-3 font-normal`
          }
        });
      }
      if (response === 'Reference Number Not Found') {
        setIsLoading(false);
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: response,
          customClass: {
            container: `${poppins.className}`,
            confirmButton: ` bg-red-500 text-white hover:bg-red-600 w-[100px] ${poppins.className} rounded-lg p-3 font-normal`
          }
        });
      }
      if (response && typeof response === 'object' && 'id' in response) {
        setIsLoading(false);
        setData(response as unknown as TDocumentRequest);
        return setViewTransactionModal(true);
      }
    } catch (err) {
      if (err instanceof Error) {
        setIsLoading(false);
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.message,
          customClass: {
            container: `${poppins.className}`,
            confirmButton: ` bg-red-500 text-white hover:bg-red-600 w-[100px] ${poppins.className} rounded-lg p-3 font-normal`
          }
        });
      }
    }
  };

  return (
    <Dialog
      open={props.modal.checkStatus}
      onClose={() => {
        setReferenceNumber('');
        props.setModal((prev) => ({ ...prev, checkStatus: false }));
      }}
      className="relative z-10 "
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      {data && (
        <ViewMoreModal
          isOpen={viewTransactionModal}
          data={data}
          onClose={() => setViewTransactionModal(false)}
          mode="VIEW"
        />
      )}

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
        <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0 ">
          <DialogPanel
            transition
            className="data-[closed]:transform-[scale(95%)] w-full max-w-2xl rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:opacity-0 "
          >
            <DialogTitle
              as="h3"
              className={`text-center text-2xl font-medium text-black/75 ${poppins.className} font-semibold`}
            >
              Reference Number
            </DialogTitle>
            <p className={`mt-1 text-sm text-black/30 ${poppins.className} mb-4 text-center font-medium`}>
              Please enter your reference number before to proceed.
            </p>
            <Input
              minLength={3}
              maxLength={30}
              name="referenceNumber"
              type="text"
              autoComplete="off"
              className={`h-14 w-full rounded-xl bg-blue-100 text-center text-black focus:outline-1 data-[focus]:bg-blue-100 ${poppins.className} caret text-2xl font-semibold uppercase caret-blue-500 focus:outline-none`}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                className={`inline-flex items-center gap-2 rounded-md bg-gray-100 px-5 py-2 text-sm/6 font-medium text-black shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-200 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white ${poppins.className} font-semibold`}
                onClick={() => {
                  setReferenceNumber('');
                  props.setModal((prev) => ({ ...prev, checkStatus: false }));
                }}
                type="button"
              >
                Cancel
              </Button>
              {isLoading ? (
                <Button
                  className={`inline-flex items-center gap-2 rounded-md bg-blue-300 px-5 py-2 text-sm/6 font-medium text-white shadow-inner  focus:outline-none  data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white ${poppins.className} font-semibold`}
                >
                  <LoaderCircle className="animate-spin" />
                </Button>
              ) : (
                <Button
                  className={`inline-flex items-center gap-2 rounded-md bg-blue-500 px-5 py-2 text-sm/6 font-medium text-white shadow-inner  focus:outline-none data-[hover]:bg-blue-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white ${poppins.className} font-semibold`}
                  onClick={onClickConfirm}
                >
                  Confirm
                </Button>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
