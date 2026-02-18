'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { TDocumentRequest } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { RequestDocumentsStatus } from '@prisma/client';
import { changeStatus } from '@/server/request';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'bg-[#FFBF61]', label: 'Pending' },
  PAID: { color: 'bg-[#72BF78]', label: 'Paid' },
  PROCESSING: { color: 'bg-[#FFBF61]', label: 'Processing' },
  READYTOPICKUP: { color: 'bg-[#36C2CE]', label: 'Ready to Pick Up' },
  OUTFORDELIVERY: { color: 'bg-[#36C2CE]', label: 'Out for Delivery' },
  COMPLETED: { color: 'bg-[#72BF78]', label: 'Completed' },
  CANCELLED: { color: 'bg-[#CC2B52]', label: 'Cancelled' }
};

function StatusCell({ data }: { data: TDocumentRequest }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const currentStatus = data.status ?? 'PENDING';

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    try {
      setIsUpdating(true);
      const response = await changeStatus({
        requestDocumentId: data.id,
        status: newStatus as RequestDocumentsStatus,
        recipient: {
          coordinates: {
            lat: data.latitude ?? '',
            lng: data.longitude ?? ''
          },
          address: data.address ?? ''
        }
      });
      if (response) {
        toast({
          title: 'Status Updated',
          description: `Status changed to ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`
        });
        router.refresh();
      }
    } catch (err) {
      toast({
        title: 'Failed to update status',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColor = STATUS_CONFIG[currentStatus]?.color ?? 'bg-gray-400';

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusColor}`} />
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="h-8 w-[170px] text-xs font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(RequestDocumentsStatus).map((status) => (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${STATUS_CONFIG[status]?.color ?? 'bg-gray-400'}`} />
                {STATUS_CONFIG[status]?.label ?? status}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const columns: ColumnDef<TDocumentRequest>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'users',
    header: 'NAME',
    cell: ({ row }) =>
      `${row?.original?.users?.UserInformation?.lastName}, ${row?.original?.users?.UserInformation?.firstName}`
  },
  {
    accessorKey: 'users.UserInformation.studentNo',
    header: 'STUDENT NO'
  },
  {
    accessorKey: 'deliverOptions',
    header: 'DELIVERY OPTIONS',
    cell: ({ row }) => <Badge variant="secondary">{row?.original?.deliverOptions ?? ''}</Badge>
  },
  {
    accessorKey: 'documentPayment.referenceNumber',
    header: 'REFERENCE NUMBER',
    cell: ({ row }) => row?.original?.documentPayment?.referenceNumber ?? 'N/A'
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => <StatusCell data={row.original} />
  },
  {
    accessorKey: 'createdAt',
    header: 'REQUEST DATE',
    cell: ({ row }) => moment(row?.original?.createdAt).format('MMMM Do YYYY, h:mm:ss a')
  },
  {
    accessorKey: 'selectedSchedule',
    header: 'APPOINTMENT DATE',
    cell: ({ row }) => {
      if (row?.original?.selectedSchedule) {
        return moment(row?.original?.selectedSchedule).format('MMMM Do YYYY');
      }
      return 'N/A';
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row?.original} />
  }
];
