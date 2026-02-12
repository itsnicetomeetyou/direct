'use client';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { Document } from '@/constants/data';
import { columns } from './columns';
import { useDocumentTableFilters } from './use-document-table-filters';

export default function DocumentsTable({ data, totalData }: { data: Document[]; totalData: number }) {
  const { isAnyFilterActive, resetFilters, searchQuery, setPage, setSearchQuery } = useDocumentTableFilters();

  return (
    <div className="space-y-4 ">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch searchKey="name" searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
        <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}
