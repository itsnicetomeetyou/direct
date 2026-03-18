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
import moment from 'moment';

export default function RequestTable({ data, totalData }: { data: Array<TDocumentRequest>; totalData: number }) {
  const { isAnyFilterActive, resetFilters, searchQuery, setPage, setSearchQuery, setStatusFilter, statusFilter } =
    useRequestTableFilters();

  function csvEscape(value: unknown) {
    const s = value === null || value === undefined ? '' : String(value);
    const needsQuotes = /[",\r\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  }

  function downloadCsv() {
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

    const rows = data.map((order) => {
      const ui = order.users?.UserInformation;
      const studentName = ui ? `${ui.lastName}, ${ui.firstName}${ui.middleName ? ` ${ui.middleName}` : ''}` : '';
      const docs = (order.DocumentSelected ?? [])
        .map((ds) => ds?.document?.name ?? '')
        .filter(Boolean)
        .join('; ');

      const totalAmount =
        order.documentPayment?.totalAmount !== null && order.documentPayment?.totalAmount !== undefined
          ? Number(order.documentPayment.totalAmount)
          : '';

      return [
        order.id,
        order.documentPayment?.referenceNumber ?? '',
        order.createdAt ? moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
        order.selectedSchedule ? moment(order.selectedSchedule).format('YYYY-MM-DD') : '',
        order.status ?? '',
        order.deliverOptions ?? '',
        ui?.studentNo ?? '',
        studentName,
        (ui as any)?.collegeDepartment ?? '',
        (ui as any)?.course ?? '',
        docs,
        totalAmount
      ].map(csvEscape);
    });

    const csv = [header.map(csvEscape).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = moment().format('YYYY-MM-DD');
    a.href = url;
    a.download = `order-list-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
          <Button variant="outline" onClick={downloadCsv}>
            Download CSV
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}
