import { useEffect } from 'react';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { PageHeading } from '../../components/PageHeading';
import { api } from '../../data-services/api';
import { getFormSubmissionError, setFormSubmissionError } from '../../lib/tanstack-form-errors';
import { doctorAvailabilityResolver } from './management/config';

const field =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10';
const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function DoctorScheduleView() {
  const cache = useQueryClient();
  const doctor = useQuery({
    queryKey: ['myDoctor'],
    queryFn: api.myDoctor,
    staleTime: 30_000,
  });
  const doctorId = doctor.data?.myDoctor.id ?? '';
  const windows = useQuery({
    queryKey: ['doctorAvailabilities', doctorId],
    queryFn: () => api.doctorAvailabilities(doctorId),
    enabled: Boolean(doctorId),
  });
  const form = useForm({
    defaultValues: {
      doctorId,
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      slotMinutes: 30,
    },
    validators: { onSubmitAsync: doctorAvailabilityResolver },
    onSubmit: async ({ value }) => submitAvailability(value),
  });
  useEffect(() => {
    form.setFieldValue('doctorId', doctorId);
  }, [doctorId, form]);

  async function refresh() {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ['doctorAvailabilities', doctorId] }),
      cache.invalidateQueries({ queryKey: ['slots'] }),
      cache.invalidateQueries({ queryKey: ['schedules'] }),
      cache.invalidateQueries({ queryKey: ['calendarSchedules'] }),
    ]);
  }
  const addAvailability = useMutation({
    mutationFn: api.setDoctorAvailability,
    onSuccess: async () => {
      form.reset({
        doctorId,
        dayOfWeek: 1,
        startTime: '',
        endTime: '',
        slotMinutes: 30,
      });
      await refresh();
    },
  });
  const removeAvailability = useMutation({
    mutationFn: api.deleteDoctorAvailability,
    onSuccess: refresh,
  });

  async function submitAvailability(values: {
    doctorId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotMinutes: number;
  }) {
    try {
      await addAvailability.mutateAsync({ ...values, doctorId });
    } catch (cause) {
      setFormSubmissionError(
        form,
        cause instanceof Error ? cause.message : 'Jam praktik gagal disimpan.',
      );
    }
  }

  return (
    <>
      <PageHeading
        eyebrow='Jadwal dokter'
        title='Jadwal praktik saya'
        description='Atur jam praktik dan durasi slot konsultasi Anda.'
      />
      {doctor.isLoading ? (
        <p role='status' className='rounded-2xl bg-white p-8 text-center text-sm text-slate-500'>
          Memuat profil dokter…
        </p>
      ) : doctor.error ? (
        <p role='alert' className='rounded-2xl bg-rose-50 p-5 text-sm text-rose-700'>
          {doctor.error.message}
        </p>
      ) : (
        <div className='grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]'>
          <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
            <h2 className='text-lg font-bold text-slate-800'>{doctor.data?.myDoctor.name}</h2>
            <p className='mt-1 text-xs text-slate-500'>
              Jam praktik disimpan dalam UTC dan digunakan untuk menentukan slot booking.
            </p>
            {windows.isLoading ? (
              <p role='status' className='py-6 text-sm text-slate-500'>
                Memuat jam praktik…
              </p>
            ) : windows.error ? (
              <p role='alert' className='mt-4 text-sm text-rose-700'>
                {windows.error.message}
              </p>
            ) : !windows.data?.doctorAvailabilities.length ? (
              <p className='mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500'>
                Belum ada jam praktik.
              </p>
            ) : (
              <ul className='mt-4 divide-y divide-slate-100'>
                {windows.data.doctorAvailabilities.map((window) => (
                  <li key={window.id} className='flex items-center justify-between gap-3 py-3'>
                    <span>
                      <strong className='block text-sm text-slate-700'>
                        {days[window.dayOfWeek]}
                      </strong>
                      <span className='text-xs text-slate-500'>
                        {window.startTime}–{window.endTime} UTC · slot {window.slotMinutes} menit
                      </span>
                    </span>
                    <button
                      type='button'
                      aria-label={`Hapus jam ${days[window.dayOfWeek]}`}
                      disabled={removeAvailability.isPending}
                      onClick={() => removeAvailability.mutate(window.id)}
                      className='rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50'
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {removeAvailability.error && (
              <p role='alert' className='mt-3 text-xs text-rose-700'>
                Gagal menghapus jam praktik: {removeAvailability.error.message}
              </p>
            )}
          </section>
          <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
            <h2 className='text-sm font-bold text-slate-800'>Tambah jam praktik</h2>
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void form.handleSubmit();
              }}
              className='mt-4 grid gap-3 sm:grid-cols-2'
            >
              <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
                {(error) => {
                  const message = getFormSubmissionError(error);
                  return message ? (
                    <p role='alert' className='text-xs text-rose-700 sm:col-span-2'>
                      {message}
                    </p>
                  ) : null;
                }}
              </form.Subscribe>
              <form.Field name='dayOfWeek'>
                {(fieldApi) => (
                  <label className='text-xs font-semibold text-slate-600'>
                    Hari
                    <select
                      name={fieldApi.name}
                      value={fieldApi.state.value}
                      onBlur={fieldApi.handleBlur}
                      onChange={(event) => fieldApi.handleChange(Number(event.target.value))}
                      className={`${field} mt-1.5`}
                    >
                      {days.map((day, index) => (
                        <option key={day} value={index}>
                          {day}
                        </option>
                      ))}
                    </select>
                    {fieldApi.state.meta.errors[0] && (
                      <span role='alert' className='mt-1 block text-xs text-rose-700'>
                        {fieldApi.state.meta.errors[0].message}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Field name='slotMinutes'>
                {(fieldApi) => (
                  <label className='text-xs font-semibold text-slate-600'>
                    Durasi slot
                    <select
                      name={fieldApi.name}
                      value={fieldApi.state.value}
                      onBlur={fieldApi.handleBlur}
                      onChange={(event) => fieldApi.handleChange(Number(event.target.value))}
                      className={`${field} mt-1.5`}
                    >
                      {[15, 20, 30, 45, 60].map((minutes) => (
                        <option key={minutes} value={minutes}>
                          {minutes} menit
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </form.Field>
              <form.Field name='startTime'>
                {(fieldApi) => (
                  <label className='text-xs font-semibold text-slate-600'>
                    Mulai
                    <input
                      name={fieldApi.name}
                      type='time'
                      value={fieldApi.state.value}
                      onBlur={fieldApi.handleBlur}
                      onChange={(event) => fieldApi.handleChange(event.target.value)}
                      className={`${field} mt-1.5`}
                    />
                    {fieldApi.state.meta.errors[0] && (
                      <span role='alert' className='mt-1 block text-xs text-rose-700'>
                        {fieldApi.state.meta.errors[0].message}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Field name='endTime'>
                {(fieldApi) => (
                  <label className='text-xs font-semibold text-slate-600'>
                    Selesai
                    <input
                      name={fieldApi.name}
                      type='time'
                      value={fieldApi.state.value}
                      onBlur={fieldApi.handleBlur}
                      onChange={(event) => fieldApi.handleChange(event.target.value)}
                      className={`${field} mt-1.5`}
                    />
                    {fieldApi.state.meta.errors[0] && (
                      <span role='alert' className='mt-1 block text-xs text-rose-700'>
                        {fieldApi.state.meta.errors[0].message}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <button
                    type='submit'
                    disabled={isSubmitting || !doctorId}
                    className='h-10 rounded-xl bg-rata-red px-4 text-xs font-semibold text-white disabled:opacity-50 sm:col-span-2 sm:justify-self-start'
                  >
                    {isSubmitting ? 'Menyimpan…' : 'Simpan jam praktik'}
                  </button>
                )}
              </form.Subscribe>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
