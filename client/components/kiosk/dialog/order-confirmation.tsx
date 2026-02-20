'use client';
import React, { useState } from 'react';
import {
  Tab,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Button,
  TabPanel,
  TabPanels,
  TabGroup,
  TabList
} from '@headlessui/react';
import { Poppins } from 'next/font/google';
import YourOrder from '../order-confirmation/your-order';
import ShippingOptions from '../order-confirmation/shipping-options';
import Address from '../order-confirmation/address';
import Schedule from '../order-confirmation/schedule';
import PaymentMethod from '../order-confirmation/payment-method';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { cleanUpOrder, cleanUpOrderData } from '@/store/kiosk/orderSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchOrderDocument } from '@/server/kiosk';
import { IOrderDocument } from '@/types';
import { LoaderCircle } from 'lucide-react';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '900'],
  subsets: ['latin']
});

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function OrderConfirmation(props: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectedDocuments = useAppSelector((state) => state.kioskOrder.orderData);
  const orderItems = useAppSelector((state) => state.kioskOrder.order);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const totalCost = orderItems.reduce((sum, item) => sum + item.price, 0);

  const skipIndices = new Set<number>();
  if (selectedDocuments.shippingOptions === 'PICKUP') skipIndices.add(2);
  if (totalCost <= 0) skipIndices.add(4);

  const lastVisibleIndex = [4, 3, 2, 1, 0].find((i) => !skipIndices.has(i)) ?? 0;

  const handleNextClick = () => {
    setSelectedIndex((prevIndex) => {
      let next = prevIndex + 1;
      while (skipIndices.has(next) && next <= 4) next++;
      return Math.min(next, lastVisibleIndex);
    });
  };

  const handleBackClick = () => {
    setSelectedIndex((prevIndex) => {
      let prev = prevIndex - 1;
      while (skipIndices.has(prev) && prev >= 0) prev--;
      return Math.max(prev, 0);
    });
  };

  const onClickConfirm = async () => {
    try {
      setIsLoading(true);
      const data: IOrderDocument = {
        documentSelected: selectedDocuments.orderItem.map((item) => item.id),
        studentNo: localStorage.getItem('studentNumber') ?? '',
        selectedSchedule: selectedDocuments.schedule,
        deliverOptions: selectedDocuments.shippingOptions,
        paymentOptions: selectedDocuments.paymentMethod,
        address: selectedDocuments.address.googleMapAddress,
        additionalAddress: selectedDocuments.address.additionalAddress,
        longitude: selectedDocuments.address.longitude,
        latitude: selectedDocuments.address.latitude
      };

      const studentNo = localStorage.getItem('studentNumber');
      if (studentNo) {
        const response = await fetchOrderDocument(data);
        if (response?.id) {
          setIsLoading(false);
          dispatch(cleanUpOrder());
          localStorage.removeItem('studentNumber');
          dispatch(cleanUpOrderData());
          router.push('/kiosk');
          return Swal.fire({
            title: 'Order Successful',
            html: `
            <div style="text-align: left;">
              <p>Your reference number is <strong>${response?.referenceNumber}</strong>.</p>
              <br />
              <p>Please pay it thru our supported payment options. Thank ou!</p>
              <br />
              <p><strong>Note:</strong> The reference number has also been sent to your email.</p>
            </div>
          `,
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
              container: `${poppins.className}`,
              confirmButton: ` bg-blue-600 text-white hover:bg-blue-700 ${poppins.className} rounded-lg p-3 font-normal`,
              cancelButton: ` bg-blue-600 text-white hover:bg-blue-700 ${poppins.className} rounded-lg p-3 font-normal`,
              title: `${poppins.className}`,
              validationMessage: `${poppins.className}`
            }
          }).then((result) => {
            if (result.isConfirmed) {
              dispatch(cleanUpOrder());
              localStorage.removeItem('studentNumber');
              dispatch(cleanUpOrderData());
              router.push('/kiosk');
              return Swal.fire({
                title: 'Thank your for using our service!',
                icon: 'success',
                customClass: {
                  container: `${poppins.className}`,
                  title: `${poppins.className}`,
                  confirmButton: ` bg-blue-600 text-white hover:bg-blue-700 ${poppins.className} rounded-lg p-3 font-normal`
                }
              });
            }
          });
        }
        setIsLoading(false);
        return Swal.fire({
          title: 'Order Failed',
          text: 'Please try again later',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            container: `${poppins.className}`,
            confirmButton: ` bg-red-600 text-white hover:bg-red-700 ${poppins.className} rounded-lg p-3 font-normal`,
            cancelButton: ` bg-red-600 text-white hover:bg-red-700 ${poppins.className} rounded-lg p-3 font-normal`,
            title: `${poppins.className}`,
            validationMessage: `${poppins.className}`
          }
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setIsLoading(false);
        return Swal.fire({
          title: 'Something went wrong',
          text: err.message,
          icon: 'error',
          customClass: {
            container: `${poppins.className}`,
            confirmButton: `bg-red-500 text-white hover:bg-red-600 ${poppins.className} rounded-lg p-3 font-normal`,
            validationMessage: `${poppins.className}`
          }
        });
      }
    }
  };

  const tabs = ['Your Order', 'Shipping Options', 'Address', 'Schedule', 'Payment Methods'];

  return (
    <Dialog
      open={props.open}
      onClose={() => {
        props.onClose();
        setSelectedIndex(0);
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
            className="data-[closed]:transform-[scale(95%)] w-full max-w-4xl rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:opacity-0 "
          >
            <DialogTitle as="h3" className={` text-lg font-medium text-black ${poppins.className} mb-12 font-semibold`}>
              Confirm Your Order
            </DialogTitle>

            <TabGroup selectedIndex={selectedIndex}>
              <TabList className="flex space-x-1 rounded-xl p-1">
                {tabs.map((tab, index) => {
                  const isSkipped = skipIndices.has(index);
                  return (
                    <Tab
                      key={index}
                      disabled={isSkipped}
                      className={({ selected }) => {
                        return classNames(
                          'w-full rounded-lg  text-sm font-semibold',
                          ' border-none outline-none',
                          poppins.className,
                          isSkipped
                            ? 'hidden'
                            : selected
                              ? ' text-sm text-blue-500 underline underline-offset-8 opacity-80'
                              : ' text-black opacity-80 hover:bg-white/[0.12] hover:text-blue-500'
                        );
                      }}
                    >
                      {tab}
                    </Tab>
                  );
                })}
              </TabList>
              <TabPanels className="mt-2">
                <TabPanel className="rounded-xl bg-white p-3">
                  <YourOrder />
                </TabPanel>

                <TabPanel className="rounded-xl bg-white p-3">
                  <ShippingOptions />
                </TabPanel>

                <TabPanel className="rounded-xl bg-white p-3">
                  <Address />
                </TabPanel>

                <TabPanel className="rounded-xl bg-white p-3">
                  <Schedule />
                </TabPanel>

                <TabPanel className="rounded-xl bg-white p-3">
                  <PaymentMethod />
                </TabPanel>
              </TabPanels>
            </TabGroup>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                className={`inline-flex items-center gap-2 rounded-md bg-gray-100 px-5 py-2 text-sm/6 font-medium text-black shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-200 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white ${poppins.className} font-semibold`}
                onClick={() => {
                  props.onClose();
                  setSelectedIndex(0);
                }}
                type="button"
              >
                Cancel
              </Button>
              {selectedIndex >= 1 && (
                <Button
                  onClick={handleBackClick}
                  className={`inline-flex items-center gap-2 rounded-md bg-blue-500 px-5 py-2 text-sm/6 font-medium text-white shadow-inner  focus:outline-none data-[hover]:bg-blue-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white ${poppins.className} font-semibold`}
                >
                  Back
                </Button>
              )}

              {selectedIndex === lastVisibleIndex ? (
                <Button
                  className={`inline-flex items-center gap-2 rounded-md bg-blue-500 px-5 py-2 text-sm/6 font-medium text-white shadow-inner  focus:outline-none data-[hover]:bg-blue-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white ${poppins.className} font-semibold`}
                  onClick={onClickConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoaderCircle className={isLoading ? 'animate-spin' : 'hidden'} size={20} color="white" />
                  ) : (
                    'Confirm'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNextClick}
                  className={`inline-flex items-center gap-2 rounded-md bg-blue-500 px-5 py-2 text-sm/6 font-medium text-white shadow-inner  focus:outline-none data-[hover]:bg-blue-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white ${poppins.className} font-semibold`}
                >
                  Next
                </Button>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
