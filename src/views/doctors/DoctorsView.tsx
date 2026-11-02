import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { PageHeading } from '../../components/PageHeading';
import { api } from '../../data-services/api';
import { useAuth } from '../../data-services/auth-context';

export default function DoctorsView() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const doctors = useQuery({
    queryKey: ['doctors', page],
    queryFn: () => api.doctors(page, 12),
    staleTime: 60_000,
  });
  const result = doctors.data?.doctors;
  return (
    <>
      <PageHeading
        eyebrow='Tim medis'
        title='Dokter kami'
        description='Pilih dokter untuk melihat waktu konsultasi yang tersedia.'
      />
      {doctors.isLoading ? (
        <p role='status' className='rounded-2xl bg-white p-8 text-center text-sm text-slate-500'>
          Memuat daftar dokter…
        </p>
      ) : doctors.error ? (
        <p role='alert' className='rounded-2xl bg-white p-8 text-center text-sm text-rose-700'>
          {doctors.error.message}
        </p>
      ) : !result?.items.length && page > 1 ? (
        <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500'>
          Tidak ada dokter di halaman ini.
        </div>
      ) : !result?.items.length ? (
        <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500'>
          Belum ada dokter yang terdaftar.
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {result.items.map((doctor) => (
            <article
              key={doctor.id}
              className='rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm'
            >
              <div className='flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-lg font-bold text-rata-red'>
                {doctor.name
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <h2 className='mt-4 font-bold text-slate-800'>{doctor.name}</h2>
              <p className='mt-1 text-sm text-slate-500'>Dokter</p>
              {user?.role === 'CUSTOMER' && (
                <Link
                  to='/appointments/new'
                  className='mt-5 inline-flex text-sm font-semibold text-rata-red'
                >
                  Buat janji temu <span className='ml-1'>→</span>
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
      {!doctors.isLoading && !doctors.error && result && result.totalPages > 1 && (
        <div className='mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-xs text-slate-500'>
            Menampilkan {result.total ? (page - 1) * result.limit + 1 : 0}–
            {Math.min(page * result.limit, result.total)} dari {result.total} dokter
          </p>
          <div className='flex items-center justify-between gap-2 sm:justify-end'>
            <button
              type='button'
              disabled={page <= 1 || doctors.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40'
            >
              Sebelumnya
            </button>
            <span className='px-2 text-xs text-slate-500'>
              Halaman {page} dari {result.totalPages}
            </span>
            <button
              type='button'
              disabled={page >= result.totalPages || doctors.isFetching}
              onClick={() => setPage((current) => Math.min(result.totalPages, current + 1))}
              className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40'
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </>
  );
}
