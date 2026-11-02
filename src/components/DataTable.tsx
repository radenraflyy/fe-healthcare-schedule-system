import { useState } from 'react';

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Icon } from './Icon';

type DataTableProps<TData> = {
  data: TData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  pageSize?: number;
  getRowId?: (row: TData) => string;
  searchableText?: (row: TData) => string;
  showPagination?: boolean;
};

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Cari data…',
  emptyMessage = 'Tidak ada data.',
  pageSize = 5,
  getRowId,
  searchableText,
  showPagination = true,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    initialState: { pagination: { pageIndex: 0, pageSize } },
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    globalFilterFn: (row, columnId, filterValue) => {
      const text = searchableText
        ? searchableText(row.original)
        : String(row.getValue(columnId) ?? '');
      return text.toLowerCase().includes(String(filterValue).toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const count = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const headers = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const pageLabel = `${table.getState().pagination.pageIndex + 1} / ${pageCount || 1}`;

  return (
    <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm'>
      <div className='flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
        <p className='text-xs text-slate-500'>{count} data</p>
        <label className='relative block'>
          <span className='sr-only'>Cari data</span>
          <Icon
            name='search'
            size={16}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
          />
          <input
            value={globalFilter ?? ''}
            onChange={(event) => {
              setGlobalFilter(event.target.value);
              table.setPageIndex(0);
            }}
            placeholder={searchPlaceholder}
            className='h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10 sm:w-65'
          />
        </label>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-155 text-left'>
          <thead>
            {headers.map((group) => (
              <tr
                key={group.id}
                className='bg-slate-50/80 text-[10px] font-bold uppercase tracking-widest text-slate-400'
              >
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                      }
                      className='px-4 py-3.5 first:px-5'
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type='button'
                          onClick={header.column.getToggleSortingHandler()}
                          className='inline-flex items-center gap-1.5 text-left hover:text-slate-700'
                          aria-label={`Urutkan berdasarkan ${String(header.column.columnDef.header)}${
                            sorted ? (sorted === 'asc' ? ', menaik' : ', menurun') : ''
                          }`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted ? (
                            <Icon name={sorted === 'asc' ? 'up' : 'down'} size={13} />
                          ) : (
                            <span aria-hidden='true' className='text-slate-300'>
                              ↕
                            </span>
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className='transition-colors hover:bg-rose-50/30'>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className='px-4 py-4 text-xs text-slate-600 first:px-5'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className='px-5 py-14 text-center text-sm text-slate-500'
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showPagination && (
        <div className='flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
          <p className='text-[11px] text-slate-400'>
            Menampilkan {count ? table.getState().pagination.pageIndex * pageSize + 1 : 0}–
            {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, count)} dari {count}
          </p>
          <div className='flex items-center justify-between gap-2 sm:justify-end'>
            <button
              type='button'
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40'
            >
              Sebelumnya
            </button>
            <span className='px-2 text-xs text-slate-500'>Halaman {pageLabel}</span>
            <button
              type='button'
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40'
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
