import { useForm, useStore } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { api } from '../../data-services/api';
import { useAuth } from '../../data-services/auth-context';
import { GraphQLRequestError } from '../../data-services/graphql';
import { formatDateTime } from '../../utils/date-time';
import { bookingResolver } from './booking/config';

const inputClass =
  'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10';

export default function BookingView({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const doctors = useQuery({
    queryKey: ['doctors', 1, 100],
    queryFn: () => api.doctors(1, 100),
    staleTime: 60_000,
  });
  const form = useForm({
    defaultValues: { doctorId: '', date: '', slot: '', objective: '' },
    validators: { onSubmitAsync: bookingResolver },
    onSubmit: async ({ value }) => {
      try {
        await booking.mutateAsync(value);
      } catch {
        /* React Query exposes the error on the mutation state. */
      }
    },
  });
  const doctorId = useStore(form.store, (state) => state.values.doctorId);
  const date = useStore(form.store, (state) => state.values.date);
  const slot = useStore(form.store, (state) => state.values.slot);
  const slots = useQuery({
    queryKey: ['slots', doctorId, date],
    queryFn: () => api.slots(doctorId, date),
    enabled: Boolean(doctorId && date),
    staleTime: 0,
  });
  const booking = useMutation({
    mutationFn: (values: { objective: string; doctorId: string; date: string; slot: string }) =>
      api.createSchedule(values.objective.trim(), values.doctorId, values.slot),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['schedules'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      navigate('/appointments', { state: { success: 'Permintaan janji temu berhasil dikirim.' } });
    },
    onError: async (cause) => {
      if (cause instanceof GraphQLRequestError && cause.code === 'CONFLICT') {
        form.setFieldValue('slot', '');
        await queryClient.invalidateQueries({ queryKey: ['slots', doctorId, date] });
      }
    },
  });

  return (
    <div
      className='fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !booking.isPending) onClose();
      }}
    >
      <section
        role='dialog'
        aria-modal='true'
        aria-labelledby='booking-dialog-title'
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !booking.isPending) onClose();
        }}
        className='w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'
      >
        <header className='flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-7'>
          <div>
            <p className='text-[10px] font-bold uppercase tracking-widest text-rata-red'>
              Janji temu
            </p>
            <h2 id='booking-dialog-title' className='mt-1 text-xl font-bold text-slate-900'>
              Buat janji temu
            </h2>
          </div>
          <button
            type='button'
            disabled={booking.isPending}
            onClick={onClose}
            aria-label='Tutup formulir janji temu'
            className='rounded-lg px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50'
          >
            ×
          </button>
        </header>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className='max-h-[calc(100vh-8rem)] overflow-y-auto p-5 sm:p-7'
        >
          {doctors.isLoading ? (
            <p role='status' className='mb-5 text-sm text-slate-500'>
              Memuat daftar dokter…
            </p>
          ) : doctors.error ? (
            <p role='alert' className='mb-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700'>
              {doctors.error.message}
            </p>
          ) : doctors.data?.doctors.items.length === 0 ? (
            <div className='mb-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600'>
              Belum ada dokter yang tersedia.
            </div>
          ) : null}
          <div className='grid gap-5 sm:grid-cols-2'>
            <form.Field name='doctorId'>
              {(field) => (
                <label className='text-xs font-semibold text-slate-700'>
                  Dokter
                  <select
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      form.setFieldValue('slot', '');
                    }}
                    className={inputClass}
                  >
                    <option value=''>Pilih dokter</option>
                    {doctors.data?.doctors.items.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                  {field.state.meta.errors[0] && (
                    <span role='alert' className='mt-1 block text-xs text-rose-700'>
                      {field.state.meta.errors[0].message}
                    </span>
                  )}
                </label>
              )}
            </form.Field>
            <form.Field name='date'>
              {(field) => (
                <label className='text-xs font-semibold text-slate-700'>
                  Tanggal
                  <input
                    name={field.name}
                    type='date'
                    min={new Date().toISOString().slice(0, 10)}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      form.setFieldValue('slot', '');
                    }}
                    className={inputClass}
                  />
                  {field.state.meta.errors[0] && (
                    <span role='alert' className='mt-1 block text-xs text-rose-700'>
                      {field.state.meta.errors[0].message}
                    </span>
                  )}
                </label>
              )}
            </form.Field>
          </div>
          {doctorId && date && (
            <section className='mt-6'>
              <h2 className='text-sm font-semibold text-slate-800'>Pilih waktu konsultasi</h2>
              <p className='mt-1 text-xs text-slate-500'>
                Waktu ditampilkan mengikuti zona waktu perangkat Anda.
              </p>
              {slots.isFetching ? (
                <p role='status' className='mt-3 text-sm text-slate-500'>
                  Memuat slot…
                </p>
              ) : slots.error ? (
                <p role='alert' className='mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700'>
                  {slots.error.message}
                </p>
              ) : !slots.data?.availableSlots.length ? (
                <p className='mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500'>
                  Tidak ada slot tersedia pada tanggal ini. Silakan pilih tanggal lain.
                </p>
              ) : (
                <div className='mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3'>
                  {slots.data.availableSlots.map((value) => (
                    <button
                      type='button'
                      key={value}
                      aria-pressed={slot === value}
                      onClick={() => form.setFieldValue('slot', value)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${slot === value ? 'border-rata-red bg-rose-50 text-rata-red' : 'border-slate-200 text-slate-600 hover:border-rata-red/50'}`}
                    >
                      {formatDateTime(value)}
                    </button>
                  ))}
                </div>
              )}
              <form.Field name='slot'>
                {(field) =>
                  field.state.meta.errors[0] && (
                    <p role='alert' className='mt-2 text-xs text-rose-700'>
                      {field.state.meta.errors[0].message}
                    </p>
                  )
                }
              </form.Field>
            </section>
          )}
          <form.Field name='objective'>
            {(field) => (
              <label className='mt-6 block text-xs font-semibold text-slate-700'>
                Tujuan konsultasi
                <textarea
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  rows={4}
                  placeholder='Jelaskan keluhan atau tujuan kunjungan Anda'
                  className='mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10'
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className='mt-1 block text-xs text-rose-700'>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          {booking.error && (
            <p
              role='alert'
              className='mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700'
            >
              {booking.error.message}
            </p>
          )}
          <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
            <button
              type='button'
              disabled={booking.isPending}
              onClick={onClose}
              className='inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 disabled:opacity-50'
            >
              Batal
            </button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <button
                  type='submit'
                  disabled={!user || isSubmitting}
                  className='inline-flex h-10 items-center justify-center rounded-xl bg-rata-red px-4 text-sm font-semibold text-white disabled:opacity-50'
                >
                  {isSubmitting ? 'Mengirim…' : 'Buat janji temu'}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </section>
    </div>
  );
}
