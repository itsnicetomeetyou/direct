import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { TDocumentRequest } from '@/constants/data';
import moment from 'moment';
import { formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem
} from '@/components/ui/select';
import { RequestDocumentsStatus } from '@prisma/client';
import { useToast } from '../ui/use-toast';
import { changeStatus } from '@/server/request';
import { ScrollArea } from '../ui/scroll-area';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { createQuotation } from '@/server/utils/lalamove';
import { IQuotation } from '@lalamove/lalamove-js';

export default function ViewMoreModal(data: {
  isOpen: boolean;
  onClose: () => void;
  data: TDocumentRequest;
  mode: 'EDIT' | 'VIEW';
}) {
  const { latitude, longitude } = data.data;
  const [shippingFees, setShippingFees] = useState<number>(0);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLEMAPAPIKEY ?? '',
    version: 'beta'
  });

  // const totalAmount = data.data.DocumentSelected.reduce((sum, doc) => Number(sum) + Number(doc.document.price), 0);
  const { toast } = useToast();
  const totalShippingFees = data.data.documentPayment.shippingFees ?? shippingFees;
  const totalDocumentFess =
    data.data.documentPayment.documentFees ??
    data.data.DocumentSelected.reduce((sum, doc) => Number(sum) + Number(doc.document.price), 0);

  const onChangeStatus = async (val: RequestDocumentsStatus) => {
    try {
      const response = await changeStatus({
        requestDocumentId: data.data.id,
        status: val,
        recipient: {
          coordinates: {
            lat: data.data.latitude ?? '',
            lng: data.data.longitude ?? ''
          },
          address: data.data.address ?? ''
        }
      });
      if (response) {
        return toast({
          title: 'Status Updated',
          description: 'Status has been updated successfully'
        });
      }
      return toast({
        title: "Couldn't update status",
        description: "Couldn't update status, please try again later",
        variant: 'destructive'
      });
    } catch (err) {
      if (err instanceof Error) {
        return toast({
          title: 'Something went wrong',
          description: err.message,
          variant: 'destructive'
        });
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (data?.data?.deliverOptions !== 'PICKUP') {
          const response: IQuotation = await createQuotation({
            coordinates: {
              lat: data?.data?.latitude ?? '',
              lng: data?.data?.longitude ?? ''
            },
            address: data?.data?.additionalAddress ?? ''
          });
          return setShippingFees(Number(response?.priceBreakdown?.total) || 0);
        }
        return setShippingFees(0);
      } catch (err) {}
    })();
  }, [data.data]);

  return (
    <Dialog open={data.isOpen} onOpenChange={data.onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Document Information</DialogTitle>
          <DialogDescription>View more information about the document request</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          <div>
            <Label htmlFor="name" className="text-1xl text-right font-bold">
              Document Order Information
            </Label>
            <div className="grid gap-4 py-4">
              <ul className="space-y-2">
                {data.data.DocumentSelected.map((doc, index) => (
                  <li key={index} className="flex items-center justify-between rounded bg-gray-100 p-2">
                    <span className="text-sm font-medium">{doc?.document?.name ?? ''}</span>
                    {Number(doc?.document?.price ?? 0) > 0 && (
                      <span className="ml-2 text-sm text-gray-500">
                        {formatCurrency(Number(doc?.document?.price ?? 0))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <Label htmlFor="name" className="text-1xl text-right font-bold">
              Student Information
            </Label>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  First name
                </Label>
                <p className="col-span-3 text-sm font-bold">{data?.data?.users?.UserInformation?.firstName ?? ''}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Middle name
                </Label>
                <p className="col-span-3 text-sm font-bold">{data?.data?.users?.UserInformation?.middleName ?? ''}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Last name
                </Label>
                <p className="col-span-3 text-sm font-bold">{data?.data?.users?.UserInformation?.lastName ?? ''}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Student No.
                </Label>
                <p className="col-span-3 text-sm font-bold">{data?.data?.users?.UserInformation?.studentNo ?? ''}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Phone No.
                </Label>
                <p className="col-span-3 text-sm font-bold">{data?.data?.users?.UserInformation?.phoneNo ?? ''}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Special Order No.
                </Label>
                <p className="col-span-3 text-sm font-bold">{data?.data?.users?.UserInformation?.specialOrder ?? ''}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  isGraduate
                </Label>
                <p className="col-span-3 text-sm font-bold">
                  {data?.data?.users?.UserInformation?.specialOrder ? 'YES' : 'NO'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="name" className="text-1xl text-right font-bold">
              Transaction Information
            </Label>
            <div className="grid gap-4 py-4">
              {Number(totalDocumentFess) > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Document Fees
                  </Label>
                  <p className="col-span-3 text-sm font-bold">{formatCurrency(Number(totalDocumentFess))}</p>
                </div>
              )}
              {Number(totalShippingFees) > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Shipping Fees
                  </Label>
                  <p className="col-span-3 text-sm font-bold">{formatCurrency(Number(totalShippingFees))}</p>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Total Amount
                </Label>
                <p className="col-span-3 text-sm font-bold">
                  {(Number(totalDocumentFess) + Number(totalShippingFees)) > 0
                    ? formatCurrency(Number(totalDocumentFess) + Number(totalShippingFees))
                    : 'Free'}
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Status
                </Label>
                {data.mode === 'VIEW' && <p className="col-span-3 text-sm font-bold">{data.data.status}</p>}
                {data.mode === 'EDIT' && (
                  <Select onValueChange={onChangeStatus} defaultValue={data?.data?.status ?? ''}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder={'Select a status'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>STATUS</SelectLabel>
                        {Object.values(RequestDocumentsStatus).map((status, index) => {
                          if (status === 'PAID')
                            return (
                              <SelectItem value={status} disabled key={index}>
                                {status}
                              </SelectItem>
                            );
                          if (status === 'PENDING')
                            return (
                              <SelectItem value={status} disabled key={index}>
                                {status}
                              </SelectItem>
                            );
                          if (status === 'READYTOPICKUP' && data.data.deliverOptions !== 'PICKUP')
                            return (
                              <SelectItem value={status} disabled key={index}>
                                {status}
                              </SelectItem>
                            );
                          if (status === 'OUTFORDELIVERY' && data.data.deliverOptions === 'PICKUP')
                            return (
                              <SelectItem value={status} disabled key={index}>
                                {status}
                              </SelectItem>
                            );
                          if (status === 'PROCESSING' && data?.data?.status === 'PAID')
                            return (
                              <SelectItem value={status} key={index}>
                                {status}
                              </SelectItem>
                            );

                          if (
                            status === 'PROCESSING' &&
                            (data?.data?.status === 'READYTOPICKUP' || data?.data?.status === 'OUTFORDELIVERY')
                          )
                            return (
                              <SelectItem value={status} disabled key={index}>
                                {status}
                              </SelectItem>
                            );
                          return (
                            <SelectItem
                              value={status}
                              disabled={
                                data?.data?.status === 'PENDING' ||
                                data?.data?.status === 'PAID' ||
                                data?.data?.status === 'COMPLETED' ||
                                data?.data?.status === 'CANCELLED'
                              }
                              key={index}
                            >
                              {status}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Delivery Options
                </Label>
                <p className="col-span-3 text-sm font-bold">{data?.data?.deliverOptions ?? ''}</p>
              </div>

              {data?.data?.selectedSchedule ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Appointment Date
                  </Label>
                  <p className="col-span-3 text-sm font-bold">
                    {moment(data?.data?.selectedSchedule).format('MMMM Do YYYY') || null}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Address
                    </Label>
                    <p className="col-span-3 text-sm font-bold">{data?.data?.address ?? ''}</p>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Additional Address
                    </Label>
                    <p className="col-span-3 text-sm font-bold">{data?.data?.additionalAddress ?? ''}</p>
                  </div>
                </>
              )}
            </div>

            {Number(latitude) !== 0 && Number(longitude) !== 0 && isLoaded && (
              <GoogleMap
                mapContainerStyle={{
                  width: '100%',
                  height: '400px'
                }}
                center={{
                  lat: Number(latitude) || 0,
                  lng: Number(longitude) || 0
                }}
                zoom={15}
              >
                <Marker
                  position={{
                    lat: Number(latitude) || 0,
                    lng: Number(longitude) || 0
                  }}
                />
              </GoogleMap>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="submit" onClick={data.onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
