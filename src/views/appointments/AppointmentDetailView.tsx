import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { api } from '../../data-services/api';
import { formatDateTime } from '../../utils/date-time';

export default function AppointmentDetailView({ onClose }: { onClose: () => void }) {
  const { id = '' } = useParams();
  const query = useQuery({
    queryKey: ['schedule', id],
    queryFn: () => api.schedule(id),
    enabled: Boolean(id),
  });
  return (
    <div
      className='fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role='dialog'
        aria-modal='true'
        aria-labelledby='appointment-detail-title'
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose();
        }}
        className='w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'
      >
        <header className='flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-7'>
          <div>
            <p className='text-[10px] font-bold uppercase tracking-widest text-rata-red'>
              Janji temu
            </p>
            <h2 id='appointment-detail-title' className='mt-1 text-xl font-bold text-slate-900'>
              Detail janji temu
            </h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup detail janji temu'
            className='rounded-lg px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700'
          >
            ×
          </button>
        </header>
        <div className='max-h-[calc(100vh-8rem)] overflow-y-auto p-5 sm:p-7'>
          {query.isLoading ? (
            <p role='status' className='text-sm text-slate-500'>
              Memuat detail…
            </p>
          ) : query.error ? (
            <p role='alert' className='rounded-xl bg-rose-50 p-3 text-sm text-rose-700'>
              {query.error.message}
            </p>
          ) : (
            query.data && (
              <>
                <h3 className='text-lg font-bold text-slate-800'>
                  {query.data.schedule.doctor.name}
                </h3>
                <dl className='mt-5 grid gap-4 text-sm sm:grid-cols-2'>
                  <div>
                    <dt className='text-xs text-slate-400'>Waktu</dt>
                    <dd className='mt-1 text-slate-700'>
                      {formatDateTime(query.data.schedule.scheduledAt, {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-xs text-slate-400'>Status</dt>
                    <dd className='mt-1 text-slate-700'>{query.data.schedule.status}</dd>
                  </div>
                  <div className='sm:col-span-2'>
                    <dt className='text-xs text-slate-400'>Tujuan konsultasi</dt>
                    <dd className='mt-1 whitespace-pre-wrap text-slate-700'>
                      {query.data.schedule.objective}
                    </dd>
                  </div>
                </dl>
              </>
            )
          )}
        </div>
        <footer className='flex justify-end border-t border-slate-100 px-5 py-4 sm:px-7'>
          <button
            type='button'
            onClick={onClose}
            className='inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600'
          >
            Tutup
          </button>
        </footer>
      </section>
    </div>
  );
}
