'use client';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { TDocumentRequest } from '@/constants/data';
import { columns } from './columns';
import { useRequestTableFilters } from './use-request-table-filters';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { RequestDocumentsStatus } from '@prisma/client';

export default function RequestTable({ data, totalData }: { data: Array<TDocumentRequest>; totalData: number }) {
  const { isAnyFilterActive, resetFilters, searchQuery, setPage, setSearchQuery, setStatusFilter, statusFilter } =
    useRequestTableFilters();

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
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}
