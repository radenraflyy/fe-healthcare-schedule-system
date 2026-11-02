import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { PageHeading } from '../../components/PageHeading';
import { api } from '../../data-services/api';
import { useAuth } from '../../data-services/auth-context';

export default function DoctorsView() {
  const { user } = useAuth();
  const doctors = useQuery({ queryKey: ['doctors'], queryFn: api.doctors, staleTime: 60_000 });
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
      ) : !doctors.data?.doctors.items.length ? (
        <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500'>
          Belum ada dokter yang terdaftar.
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {doctors.data.doctors.items.map((doctor) => (
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
    </>
  );
}
