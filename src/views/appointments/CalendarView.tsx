import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { PageHeading } from '../../components/PageHeading';
import { api } from '../../data-services/api';

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayFromMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayFromMonday);
  return start;
}
function shiftDate(date: Date, days: number) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}
function sameLocalDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export default function CalendarView() {
  const [anchor, setAnchor] = useState(() => new Date());
  const [today] = useState(() => new Date());
  const start = startOfWeek(anchor);
  const end = shiftDate(start, 7);
  const query = useQuery({
    queryKey: ['calendarSchedules', start.toISOString()],
    queryFn: () =>
      api.schedules({
        page: 1,
        limit: 100,
        from: start.toISOString(),
        to: new Date(end.getTime() - 1).toISOString(),
      }),
    staleTime: 15_000,
  });
  const days = Array.from({ length: 7 }, (_, index) => shiftDate(start, index));
  const appointments = query.data?.schedules.items ?? [];
  const period = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(
    start,
  );
  return (
    <>
      <PageHeading
        eyebrow='Kalender'
        title='Kalender janji temu'
        description='Jadwal mingguan pasien dalam zona waktu perangkat Anda.'
      />
      <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm'>
        <div className='flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
          <div>
            <h2 className='text-base font-bold capitalize text-slate-800'>{period}</h2>
            <p className='mt-1 text-xs text-slate-400'>
              {new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(start)}{' '}
              –{' '}
              {new Intl.DateTimeFormat(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }).format(shiftDate(start, 6))}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              aria-label='Minggu sebelumnya'
              onClick={() => setAnchor((date) => shiftDate(date, -7))}
              className='rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50'
            >
              <Icon name='back' size={16} />
            </button>
            <button
              onClick={() => setAnchor(new Date())}
              className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50'
            >
              Hari ini
            </button>
            <button
              aria-label='Minggu berikutnya'
              onClick={() => setAnchor((date) => shiftDate(date, 7))}
              className='rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50'
            >
              <Icon name='chevron' size={16} />
            </button>
          </div>
        </div>
        {query.isLoading ? (
          <p role='status' className='p-12 text-center text-sm text-slate-500'>
            Memuat jadwal…
          </p>
        ) : query.error ? (
          <p role='alert' className='m-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700'>
            {query.error.message}
          </p>
        ) : (
          <div className='grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-7'>
            {days.map((date) => {
              const dayItems = appointments.filter((item) =>
                sameLocalDay(new Date(item.scheduledAt), date),
              );
              const isToday = sameLocalDay(date, today);
              return (
                <section key={date.toISOString()} className='min-h-40 bg-white p-3'>
                  <div className='mb-3 flex items-baseline justify-between'>
                    <h3
                      className={`text-xs font-bold ${isToday ? 'text-rata-red' : 'text-slate-500'}`}
                    >
                      {new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date)}
                    </h3>
                    <span
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${isToday ? 'bg-rata-red text-white' : 'text-slate-700'}`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  {dayItems.length ? (
                    <ul className='space-y-2'>
                      {dayItems.map((item) => (
                        <li key={item.id}>
                          <Link
                            to={`/appointments/${item.id}`}
                            className='block rounded-lg border border-slate-100 bg-slate-50 p-2 transition hover:border-rose-200 hover:bg-rose-50'
                          >
                            <p className='text-[11px] font-bold text-rata-red'>
                              {new Intl.DateTimeFormat(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                              }).format(new Date(item.scheduledAt))}
                            </p>
                            <p className='mt-1 truncate text-xs font-semibold text-slate-700'>
                              {item.customer.name}
                            </p>
                            <p className='truncate text-[10px] text-slate-500'>
                              {item.doctor.name}
                            </p>
                            <span className='mt-1 inline-block text-[10px] text-slate-400'>
                              {item.status}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='py-2 text-[11px] text-slate-300'>Tidak ada janji</p>
                  )}
                </section>
              );
            })}
          </div>
        )}
        {!query.isLoading && !query.error && appointments.length === 0 && (
          <p className='border-t border-slate-100 px-4 py-3 text-center text-xs text-slate-400'>
            Tidak ada janji temu pada minggu ini.
          </p>
        )}
      </section>
    </>
  );
}
