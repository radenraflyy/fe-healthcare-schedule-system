import { useState } from 'react';

import { useForm, useStore } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';

import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeading } from '../../components/PageHeading';
import { PrimaryButton } from '../../components/PrimaryButton';
import { type Appointment, api } from '../../data-services/api';
import { canCustomerCancel, canRoleUpdateStatus } from '../../data-services/appointment-rules';
import { useAuth } from '../../data-services/auth-context';
import { GraphQLRequestError } from '../../data-services/graphql';
import { rescheduleResolver } from './reschedule/config';

function displayTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(
    new Date(value),
  );
}
const statusLabels = {
  REQUESTED: 'Menunggu konfirmasi',
  CONFIRMED: 'Terkonfirmasi',
  CANCELLED: 'Dibatalkan',
  COMPLETED: 'Selesai',
};
export default function AppointmentsView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [scheduleToDelete, setScheduleToDelete] = useState<Appointment | null>(null);
  const schedules = useQuery({
    queryKey: ['schedules'],
    queryFn: () => api.schedules(),
    staleTime: 15_000,
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' }) =>
      api.updateStatus(
        id,
        status,
        status === 'CANCELLED' ? 'Dibatalkan oleh pengguna.' : undefined,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['schedules'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  const remove = useMutation({
    mutationFn: api.deleteSchedule,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['schedules'] }),
        queryClient.invalidateQueries({ queryKey: ['calendarSchedules'] }),
        queryClient.invalidateQueries({ queryKey: ['customerAppointments'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ]);
    },
  });
  const actionError = update.error?.message ?? remove.error?.message;
  function action(item: Appointment, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
    update.reset();
    remove.reset();
    update.mutate({ id: item.id, status });
  }

  return (
    <>
      <PageHeading
        eyebrow='Janji temu'
        title='Jadwal saya'
        description='Lihat dan kelola janji temu Anda.'
        action={
          user?.role === 'CUSTOMER' ? (
            <PrimaryButton to='/appointments/new'>Buat janji temu</PrimaryButton>
          ) : undefined
        }
      />
      {(location.state as { success?: string } | null)?.success && (
        <div
          role='status'
          className='mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'
        >
          {(location.state as { success: string }).success}
        </div>
      )}
      {actionError && (
        <div
          role='alert'
          className='mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'
        >
          {actionError}
        </div>
      )}
      {schedules.isLoading ? (
        <p role='status' className='rounded-2xl bg-white p-8 text-center text-sm text-slate-500'>
          Memuat jadwal…
        </p>
      ) : schedules.error ? (
        <div role='alert' className='rounded-2xl bg-white p-8 text-center text-sm text-rose-700'>
          {schedules.error.message}
        </div>
      ) : !schedules.data?.schedules.items.length ? (
        <div className='rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center'>
          <h2 className='font-semibold text-slate-800'>Belum ada janji temu</h2>
          <p className='mt-1 text-sm text-slate-500 mb-3'>
            Jadwalkan konsultasi dengan dokter pilihan Anda.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {schedules.data.schedules.items.map((item) => (
            <AppointmentCard
              key={item.id}
              item={item}
              role={user?.role ?? 'CUSTOMER'}
              busy={update.isPending || remove.isPending}
              onAction={action}
              onDelete={() => setScheduleToDelete(item)}
            />
          ))}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(scheduleToDelete)}
        title='Hapus janji temu?'
        description='Janji temu ini akan dihapus dan tidak dapat dipulihkan.'
        confirmLabel='Hapus janji temu'
        pending={remove.isPending}
        onCancel={() => setScheduleToDelete(null)}
        onConfirm={() => {
          if (!scheduleToDelete) return;
          remove.mutate(scheduleToDelete.id, {
            onSettled: () => setScheduleToDelete(null),
          });
        }}
      />
    </>
  );
}

function AppointmentCard({
  item,
  role,
  busy,
  onAction,
  onDelete,
}: {
  item: Appointment;
  role: string;
  busy: boolean;
  onAction: (item: Appointment, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => void;
  onDelete: () => void;
}) {
  const [rescheduling, setRescheduling] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: { date: '', slot: '' },
    validators: { onSubmitAsync: rescheduleResolver },
    onSubmit: async () => submitReschedule(),
  });
  const date = useStore(form.store, (state) => state.values.date);
  const slot = useStore(form.store, (state) => state.values.slot);
  const slots = useQuery({
    queryKey: ['rescheduleSlots', item.doctorId, date],
    queryFn: () => api.slots(item.doctorId, date),
    enabled: rescheduling && Boolean(date),
  });
  const reschedule = useMutation({
    mutationFn: () => api.reschedule(item.id, slot),
    onSuccess: async () => {
      setRescheduling(false);
      await queryClient.invalidateQueries({ queryKey: ['schedules'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: async (cause) => {
      if (cause instanceof GraphQLRequestError && cause.code === 'CONFLICT') {
        form.setFieldValue('slot', '');
        await queryClient.invalidateQueries({ queryKey: ['rescheduleSlots', item.doctorId, date] });
      }
    },
  });
  async function submitReschedule() {
    try {
      await reschedule.mutateAsync();
    } catch {
      /* React Query exposes the error on the mutation state. */
    }
  }
  const isCustomer = role === 'CUSTOMER';
  return (
    <article className='rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6'>
      <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-start'>
        <div>
          <p className='text-xs font-bold uppercase tracking-wide text-rata-red'>
            {statusLabels[item.status]}
          </p>
          <h2 className='mt-1 text-lg font-bold text-slate-800'>{item.doctor.name}</h2>
          <p className='mt-1 text-sm text-slate-500'>
            {displayTime(item.scheduledAt)} · {item.durationMinutes} menit
          </p>
        </div>
        <Link to={`/appointments/${item.id}`} className='text-sm font-semibold text-rata-red'>
          Detail jadwal →
        </Link>
      </div>
      <p className='mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600'>
        {item.objective}
      </p>
      {item.cancelReason && (
        <p className='mt-2 text-xs text-slate-500'>Alasan pembatalan: {item.cancelReason}</p>
      )}
      <div className='mt-4 flex flex-wrap gap-2'>
        {isCustomer && canCustomerCancel(item.status, item.scheduledAt, new Date().getTime()) && (
          <button
            disabled={busy}
            onClick={() => onAction(item, 'CANCELLED')}
            className='rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50'
          >
            Batalkan jadwal
          </button>
        )}
        {isCustomer && item.status === 'REQUESTED' && (
          <button
            onClick={() => setRescheduling((value) => !value)}
            className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600'
          >
            {rescheduling ? 'Tutup jadwal ulang' : 'Jadwalkan ulang'}
          </button>
        )}
        {canRoleUpdateStatus(role, item.status, 'CONFIRMED') && (
          <button
            disabled={busy}
            onClick={() => onAction(item, 'CONFIRMED')}
            className='rounded-lg bg-rata-red px-3 py-2 text-xs font-semibold text-white disabled:opacity-50'
          >
            Konfirmasi jadwal
          </button>
        )}
        {canRoleUpdateStatus(role, item.status, 'COMPLETED') &&
          new Date(item.scheduledAt).getTime() + item.durationMinutes * 60_000 <=
            new Date().getTime() && (
            <button
              disabled={busy}
              onClick={() => onAction(item, 'COMPLETED')}
              className='rounded-lg bg-rata-red px-3 py-2 text-xs font-semibold text-white disabled:opacity-50'
            >
              Tandai selesai
            </button>
          )}
        {role === 'ADMIN' && (
          <button
            disabled={busy}
            onClick={onDelete}
            className='rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50'
          >
            Hapus jadwal
          </button>
        )}
      </div>
      {rescheduling && (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className='mt-4 rounded-xl border border-slate-200 p-4'
        >
          <form.Field name='date'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-700'>
                Tanggal baru
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
                  className='mt-1.5 h-10 rounded-lg border border-slate-200 px-3 text-sm'
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className='mt-1 block text-xs text-rose-700'>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          {date &&
            (slots.isLoading ? (
              <p className='mt-3 text-sm text-slate-500'>Memuat slot…</p>
            ) : slots.error ? (
              <p role='alert' className='mt-3 text-sm text-rose-700'>
                {slots.error.message}
              </p>
            ) : slots.data?.availableSlots.length ? (
              <div className='mt-3 flex flex-wrap gap-2'>
                {slots.data.availableSlots.map((value) => (
                  <button
                    type='button'
                    key={value}
                    onClick={() => {
                      form.setFieldValue('slot', value);
                    }}
                    aria-pressed={slot === value}
                    className={`rounded-lg border px-3 py-2 text-xs ${slot === value ? 'border-rata-red bg-rose-50 text-rata-red' : 'border-slate-200 text-slate-600'}`}
                  >
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(value))}
                  </button>
                ))}
              </div>
            ) : (
              !slots.isLoading && (
                <p className='mt-3 text-sm text-slate-500'>
                  Tidak ada slot tersedia pada tanggal ini.
                </p>
              )
            ))}
          <form.Field name='slot'>
            {(field) =>
              field.state.meta.errors[0] && (
                <p role='alert' className='mt-2 text-xs text-rose-700'>
                  {field.state.meta.errors[0].message}
                </p>
              )
            }
          </form.Field>
          {reschedule.error && (
            <p role='alert' className='mt-3 text-sm text-rose-700'>
              {reschedule.error.message}
            </p>
          )}
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type='submit'
                disabled={isSubmitting}
                className='mt-3 rounded-lg bg-rata-red px-3 py-2 text-xs font-semibold text-white disabled:opacity-50'
              >
                {isSubmitting ? 'Menyimpan…' : 'Simpan waktu baru'}
              </button>
            )}
          </form.Subscribe>
        </form>
      )}
    </article>
  );
}
