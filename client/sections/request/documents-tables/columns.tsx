'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { TDocumentRequest } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-[#FFBF61]', text: 'text-white', label: 'PENDING' },
  PAID: { bg: 'bg-[#72BF78]', text: 'text-white', label: 'PAID' },
  PROCESSING: { bg: 'bg-[#36C2CE]', text: 'text-white', label: 'PROCESSING' },
  READYTOPICKUP: { bg: 'bg-[#36C2CE]', text: 'text-white', label: 'READYTOPICKUP' },
  OUTFORDELIVERY: { bg: 'bg-[#FFBF61]', text: 'text-white', label: 'OUTFORDELIVERY' },
  COMPLETED: { bg: 'bg-[#72BF78]', text: 'text-white', label: 'COMPLETED' },
  CANCELLED: { bg: 'bg-[#CC2B52]', text: 'text-white', label: 'CANCELLED' }
};

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
    cell: ({ row }) => {
      const status = row?.original?.status ?? 'PENDING';
      const config = STATUS_CONFIG[status] ?? { bg: 'bg-gray-400', text: 'text-white', label: status };
      return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      );
    }
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
  }
];
