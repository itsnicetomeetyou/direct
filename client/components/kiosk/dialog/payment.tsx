'use client';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Button } from '@headlessui/react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '900'],
  subsets: ['latin']
});

export default function Payment(props: { open: boolean; onClose: () => void }) {
  return (
    <Dialog
      open={props.open}
      onClose={() => {
        props.onClose();
      }}
      className="relative z-10 "
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
        <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0 ">
          <DialogPanel
            transition
            className="data-[closed]:transform-[scale(95%)] w-full max-w-xl rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:opacity-0 "
          >
            <DialogTitle
              as="h3"
              className={` text-lg font-medium text-black ${poppins.className} my-8 mb-12 text-center font-semibold`}
            >
              Pay Now or Pay Later?
            </DialogTitle>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                className={`w-full bg-blue-600 text-white hover:bg-blue-700 ${poppins.className} rounded-xl p-3 font-medium`}
              >
                Pay Now
              </Button>
              <Button
                className={`w-full bg-blue-600 text-white hover:bg-blue-700 ${poppins.className} rounded-xl p-3 font-medium`}
              >
                Pay Later
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
