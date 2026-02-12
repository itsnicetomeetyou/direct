import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { TDocumentRequest } from '@/constants/data';
import { retrieveOrder } from '@/server/utils/lalamove';
import { useEffect, useState } from 'react';
import { IOrder } from '@lalamove/lalamove-js/dist/response/order';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function ViewTrackingModal(data: { isOpen: boolean; onClose: () => void; data: TDocumentRequest }) {
  const [order, setOrder] = useState<IOrder | null>(null);

  useEffect(() => {
    (async () => {
      if (data.data?.logisticOrderId) {
        const response: IOrder = await retrieveOrder(data.data.logisticOrderId);
        setOrder(response);
      }
    })();
  }, [data.data.logisticOrderId]);

  return (
    <Dialog open={data.isOpen} onOpenChange={data.onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Logistic Information</DialogTitle>
          <DialogDescription>View the logistic information of the student&apos;s document request.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          <div>
            <Label htmlFor="name" className="text-1xl text-right font-bold">
              Logistic Information
            </Label>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Open Map
                </Label>
                {/* <p className="col-span-3 text-sm font-bold">{order?.shareLink}</p> */}

                {/* <Button className="col-span-3 items-start justify-start text-left" variant="link" asChild> */}
                <Link
                  href={order?.shareLink ?? ''}
                  target="_blank"
                  className="col-span-3 text-sm font-medium text-blue-500 underline"
                >
                  View Logistic Map
                </Link>
                {/* </Button> */}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Status
                </Label>
                <p className="col-span-3 text-sm font-bold">{order?.status ?? ''}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Distance
                </Label>
                <p className="col-span-3 text-sm font-bold">{order?.distance.value.concat(order?.distance.unit)}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Shipping Fees
                </Label>
                <p className="col-span-3 text-sm font-bold">
                  {formatCurrency(Number(order?.priceBreakdown.total) ?? '')}
                </p>
              </div>
            </div>
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
