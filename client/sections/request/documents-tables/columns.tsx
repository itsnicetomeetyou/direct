'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { TDocumentRequest } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { RequestDocumentsStatus } from '@prisma/client';
import { changeStatus } from '@/server/request';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { CellAction } from './cell-action';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  PENDING: { bg: 'bg-[#FFBF61]', label: 'PENDING' },
  PAID: { bg: 'bg-[#72BF78]', label: 'PAID' },
  PROCESSING: { bg: 'bg-[#36C2CE]', label: 'PROCESSING' },
  READYTOPICKUP: { bg: 'bg-[#36C2CE]', label: 'READYTOPICKUP' },
  OUTFORDELIVERY: { bg: 'bg-[#FFBF61]', label: 'OUTFORDELIVERY' },
  COMPLETED: { bg: 'bg-[#72BF78]', label: 'COMPLETED' },
  CANCELLED: { bg: 'bg-[#CC2B52]', label: 'CANCELLED' }
};

function StatusCell({ data }: { data: TDocumentRequest }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const currentStatus = data.status ?? 'PENDING';
  const config = STATUS_CONFIG[currentStatus] ?? { bg: 'bg-gray-400', label: currentStatus };

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isUpdating} className="cursor-pointer focus:outline-none">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white ${config.bg}`}>
          {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
          {config.label}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleStatusChange(key)}
            className="flex items-center gap-2"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${val.bg}`} />
            {val.label}
            {key === currentStatus && <span className="ml-auto text-xs text-muted-foreground">current</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
