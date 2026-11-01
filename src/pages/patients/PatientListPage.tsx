import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '../../components/Avatar';
import { Icon } from '../../components/Icon';
import { PageHeading } from '../../components/PageHeading';
import { PrimaryButton } from '../../components/PrimaryButton';
import { type CustomerProfile, api } from '../../data-services/api';

const PAGE_SIZE = 10;
function matches(patient: CustomerProfile, search: string) {
  const term = search.trim().toLowerCase();
  return (
    !term ||
    [
      patient.id,
      patient.name,
      patient.email,
      patient.phone,
      patient.address,
      patient.treatment,
      patient.status,
    ].some((value) => value?.toLowerCase().includes(term))
  );
}

export default function PatientListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);
  const list = useQuery({
    queryKey: ['customers', page],
    queryFn: () => api.customers(page, PAGE_SIZE),
    enabled: !debouncedSearch,
    staleTime: 30_000,
  });
  const searchResults = useQuery({
    queryKey: ['customersSearch', debouncedSearch],
    queryFn: () => api.searchCustomers(debouncedSearch),
    enabled: Boolean(debouncedSearch),
    staleTime: 30_000,
  });
  const filtered = searchResults.data?.filter((patient) => matches(patient, debouncedSearch)) ?? [];
  const totalPages = debouncedSearch
    ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    : (list.data?.customers.totalPages ?? 1);
  const visiblePatients = debouncedSearch
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : (list.data?.customers.items ?? []);
  const total = debouncedSearch ? filtered.length : (list.data?.customers.total ?? 0);
  const loading = debouncedSearch ? searchResults.isLoading : list.isLoading;
  const error = debouncedSearch ? searchResults.error : list.error;

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <>
      <PageHeading
        eyebrow='Manajemen klinik'
        title='Daftar Pasien'
        description='Cari dan kelola profil pasien yang tersimpan di klinik.'
        action={
          <PrimaryButton to='/patients/new'>
            <Icon name='plus' size={17} />
            Tambah pasien
          </PrimaryButton>
        }
      />
      <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]'>
        <div className='flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
          <div>
            <h2 className='text-sm font-bold text-slate-800'>
              Semua pasien{' '}
              <span className='ml-1.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500'>
                {total}
              </span>
            </h2>
            <p className='mt-1 text-xs text-slate-400'>
              Profil dan jadwal pasien dari layanan klinik.
            </p>
          </div>
          <label className='relative block'>
            <span className='sr-only'>Cari pasien</span>
            <Icon
              name='search'
              size={16}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
            />
            <input
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder='Cari nama atau email…'
              className='h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10 sm:w-[260px]'
            />
          </label>
        </div>
        {error && (
          <p role='alert' className='m-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700'>
            {error.message}
          </p>
        )}
        {loading ? (
          <p role='status' className='px-5 py-14 text-center text-sm text-slate-500'>
            {debouncedSearch ? 'Mencari pasien…' : 'Memuat pasien…'}
          </p>
        ) : !error && visiblePatients.length === 0 ? (
          <div className='px-5 py-14 text-center'>
            <span className='mx-auto flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400'>
              <Icon name='search' size={20} />
            </span>
            <p className='mt-3 text-sm font-semibold text-slate-700'>
              {debouncedSearch ? 'Pasien tidak ditemukan' : 'Belum ada pasien'}
            </p>
            <p className='mt-1 text-xs text-slate-400'>
              {debouncedSearch
                ? 'Coba kata kunci lain.'
                : 'Tambahkan profil pasien untuk mulai mengelola jadwal.'}
            </p>
          </div>
        ) : (
          <>
            <div className='hidden overflow-x-auto md:block'>
              <table className='w-full min-w-[560px] text-left'>
                <thead>
                  <tr className='bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400'>
                    <th className='px-5 py-3.5'>Pasien</th>
                    <th className='px-4 py-3.5'>Email</th>
                    <th className='px-4 py-3.5'>Terdaftar</th>
                    <th className='w-9 px-3 py-3.5' />
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {visiblePatients.map((patient) => (
                    <tr
                      key={patient.id}
                      tabIndex={0}
                      className='group cursor-pointer transition-colors hover:bg-rose-50/30'
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') navigate(`/patients/${patient.id}`);
                      }}
                    >
                      <td className='px-5 py-4'>
                        <div className='flex items-center gap-3'>
                          <Avatar name={patient.name} />
                          <div>
                            <p className='text-sm font-semibold text-slate-800 group-hover:text-rata-red'>
                              {patient.name}
                            </p>
                            <p className='mt-0.5 text-[11px] text-slate-400'>{patient.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-4 text-xs text-slate-600'>{patient.email}</td>
                      <td className='px-4 py-4 text-xs text-slate-500'>
                        {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
                          new Date(patient.createdAt),
                        )}
                      </td>
                      <td className='px-3 py-4'>
                        <Icon
                          name='chevron'
                          size={17}
                          className='text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rata-red'
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='divide-y divide-slate-100 md:hidden'>
              {visiblePatients.map((patient) => (
                <button
                  key={patient.id}
                  type='button'
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className='flex w-full items-center gap-3 px-4 py-4 text-left'
                >
                  <Avatar name={patient.name} size='sm' />
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-sm font-semibold text-slate-800'>
                      {patient.name}
                    </span>
                    <span className='mt-1 block truncate text-xs text-slate-400'>
                      {patient.email}
                    </span>
                  </span>
                  <Icon name='chevron' size={16} className='shrink-0 text-slate-300' />
                </button>
              ))}
            </div>
          </>
        )}
        <div className='flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
          <p className='text-[11px] text-slate-400'>
            Menampilkan {total ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, total)}{' '}
            dari {total} pasien
          </p>
          <div className='flex items-center justify-between gap-2 sm:justify-end'>
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40'
            >
              Sebelumnya
            </button>
            <span className='px-2 text-xs text-slate-500'>
              Halaman {page} dari {totalPages}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40'
            >
              Berikutnya
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
