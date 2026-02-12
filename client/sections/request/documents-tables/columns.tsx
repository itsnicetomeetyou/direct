'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { TDocumentRequest } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

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
    accessorKey: 'DocumentSelected',
    header: 'DOCUMENT SELECTED',
    cell: ({ row }) => (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="link">View Documents</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>List of document requested</AlertDialogTitle>
            <AlertDialogDescription>
              <ul className=" list-disc">
                {row?.original?.DocumentSelected?.map((doc) => (
                  <li>
                    <p>{doc?.document?.name ?? ''}</p>
                  </li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      if (row?.original?.status === 'PENDING') {
        return <Badge className="bg-[#FFBF61] hover:bg-[#FFBF6180]">{row?.original?.status}</Badge>;
      }
      if (row?.original?.status === 'PAID') {
        return <Badge className="bg-[#72BF78] hover:bg-[#72BF7880]">{row?.original?.status}</Badge>;
      }
      if (row?.original?.status === 'PROCESSING') {
        return <Badge className="bg-[#FFBF61] hover:bg-[#FFBF6180]">{row?.original?.status}</Badge>;
      }
      if (row?.original?.status === 'READYTOPICKUP') {
        return <Badge className="bg-[#36C2CE] hover:bg-[#36C2CE80]">{row?.original?.status}</Badge>;
      }
      if (row.original?.status === 'OUTFORDELIVERY') {
        return <Badge className="bg-[#36C2CE] hover:bg-[#36C2CE80]">{row?.original?.status}</Badge>;
      }
      if (row?.original?.status === 'COMPLETED') {
        return <Badge className="bg-[#72BF78] hover:bg-[#72BF7880]">{row?.original?.status}</Badge>;
      }
      if (row?.original?.status === 'CANCELLED') {
        return <Badge className="bg-[#CC2B52] hover:bg-[#CC2B5280]">{row?.original?.status}</Badge>;
      }
      return <Badge variant="secondary">Unknown</Badge>;
    }
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
    accessorKey: 'createdAt',
    header: 'REQUEST DATE',
    cell: ({ row }) => moment(row?.original?.createdAt).format('MMMM Do YYYY, h:mm:ss a')
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row?.original} />
  }
];
