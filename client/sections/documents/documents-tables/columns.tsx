'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Document } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import moment from 'moment';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<Document>[] = [
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
    accessorKey: 'name',
    header: 'NAME'
  },
  {
    accessorKey: 'price',
    header: 'PRICE',
    cell: ({ row }) => formatCurrency(row.original.price)
  },
  {
    accessorKey: 'isAvailable',
    header: 'STATUS',
    cell: ({ row }) => {
      if (row.original.isAvailable) {
        return <Badge className="bg-green-500 text-white">Available</Badge>;
      } else {
        return <Badge className="bg-red-500 text-white">Not Available</Badge>;
      }
    }
  },
  {
    accessorKey: 'eligibility',
    header: 'ELIGIBILITY',
    cell: ({ row }) => <Badge variant="secondary">{row.original.eligibility}</Badge>
  },
  {
    accessorKey: 'createdAt',
    header: 'CREATED AT',
    cell: ({ row }) => moment(row.original.createdAt).format('DD MMM YYYY')
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
