'use client';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { TDocumentRequest } from '@/constants/data';
import { columns } from './columns';
import { useRequestTableFilters } from './use-request-table-filters';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { RequestDocumentsStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { exportDocumentRequestsForCsv } from '@/server/document';
import moment from 'moment';
import { useState } from 'react';

export default function RequestTable({ data, totalData }: { data: Array<TDocumentRequest>; totalData: number }) {
  const { toast } = useToast();
  const [csvLoading, setCsvLoading] = useState(false);
  const { isAnyFilterActive, resetFilters, searchQuery, setPage, setSearchQuery, setStatusFilter, statusFilter } =
    useRequestTableFilters();

  function csvEscape(value: unknown) {
    const s = value === null || value === undefined ? '' : String(value);
    const needsQuotes = /[",\r\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  }

  async function downloadCsv() {
    setCsvLoading(true);
    try {
      const rows = await exportDocumentRequestsForCsv({
        search: searchQuery || null,
        status: statusFilter || null
      });

      const header = [
        'Order ID',
        'Reference Number',
        'Request Date',
        'Appointment Date',
        'Status',
        'Delivery Option',
        'Student No',
        'Student Name',
        'College Department',
        'Course',
        'Documents',
        'Total Amount'
      ];

      const csvRows = rows.map((order) =>
        [
          order.id,
          order.referenceNumber,
          order.createdAt ? moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
          order.selectedSchedule ? moment(order.selectedSchedule).format('YYYY-MM-DD') : '',
          order.status,
          order.deliverOptions,
          order.studentNo,
          order.studentName,
          order.collegeDepartment,
          order.course,
          order.documents,
          order.totalAmount
        ].map(csvEscape)
      );

      const csv = [header.map(csvEscape).join(','), ...csvRows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = moment().format('YYYY-MM-DD');
      a.href = url;
      a.download = `order-list-${date}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({
        title: 'CSV downloaded',
        description:
          rows.length >= 50_000
            ? `Exported first 50,000 orders (apply filters to narrow).`
            : `${rows.length} order${rows.length === 1 ? '' : 's'} exported.`
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'Could not export orders. Please try again.'
      });
    } finally {
      setCsvLoading(false);
    }
  }

  return (
    <div className="space-y-4 ">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch searchKey="name" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
        <DataTableFilterBox
          filterKey="status"
          title="Status"
          options={Object.values(RequestDocumentsStatus).map((status) => ({
            label: status,
            value: status
          }))}
          setFilterValue={setStatusFilter}
          filterValue={statusFilter}
        />
        <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
        <div className="ml-auto">
          <Button variant="outline" onClick={downloadCsv} disabled={csvLoading}>
            {csvLoading ? 'Exporting…' : 'Download CSV'}
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}
