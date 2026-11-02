import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { PageHeading } from '../../components/PageHeading';
import { api } from '../../data-services/api';

export default function AppointmentDetailView() {
  const { id = '' } = useParams();
  const query = useQuery({
    queryKey: ['schedule', id],
    queryFn: () => api.schedule(id),
    enabled: Boolean(id),
  });
  return (
    <>
      <PageHeading
        eyebrow='Janji temu'
        title='Detail jadwal'
        action={
          <Link to='/appointments' className='text-sm font-semibold text-rata-red'>
            ← Kembali ke jadwal
          </Link>
        }
      />
      {query.isLoading ? (
        <p role='status' className='rounded-2xl bg-white p-6 text-sm text-slate-500'>
          Memuat detail…
        </p>
      ) : query.error ? (
        <p role='alert' className='rounded-2xl bg-white p-6 text-sm text-rose-700'>
          {query.error.message}
        </p>
      ) : (
        query.data && (
          <section className='max-w-2xl rounded-2xl border border-slate-200 bg-white p-6'>
            <h2 className='text-lg font-bold text-slate-800'>{query.data.schedule.doctor.name}</h2>
            <dl className='mt-5 grid gap-4 text-sm sm:grid-cols-2'>
              <div>
                <dt className='text-xs text-slate-400'>Waktu</dt>
                <dd className='mt-1 text-slate-700'>
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  }).format(new Date(query.data.schedule.scheduledAt))}
                </dd>
              </div>
              <div>
                <dt className='text-xs text-slate-400'>Status</dt>
                <dd className='mt-1 text-slate-700'>{query.data.schedule.status}</dd>
              </div>
              <div className='sm:col-span-2'>
                <dt className='text-xs text-slate-400'>Tujuan konsultasi</dt>
                <dd className='mt-1 text-slate-700'>{query.data.schedule.objective}</dd>
              </div>
            </dl>
          </section>
        )
      )}
    </>
  );
}
