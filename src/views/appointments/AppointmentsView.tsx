import { useMemo, useState } from 'react';

import { useForm, useStore } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DataTable } from '../../components/DataTable';
import { PageHeading } from '../../components/PageHeading';
import { PrimaryButton } from '../../components/PrimaryButton';
import { type Appointment, api } from '../../data-services/api';
import { canCustomerCancel, canRoleUpdateStatus } from '../../data-services/appointment-rules';
import { useAuth } from '../../data-services/auth-context';
import { GraphQLRequestError } from '../../data-services/graphql';
import { formatDateTime } from '../../utils/date-time';
import AppointmentDetailView from './AppointmentDetailView';
import BookingView from './BookingView';
import { rescheduleResolver } from './reschedule/config';

const statusLabels = {
  REQUESTED: 'Menunggu konfirmasi',
  CONFIRMED: 'Terkonfirmasi',
  CANCELLED: 'Dibatalkan',
  COMPLETED: 'Selesai',
};
const PAGE_SIZE = 5;
const appointmentColumn = createColumnHelper<Appointment>();
export default function AppointmentsView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingOpen = location.pathname === '/appointments/new';
  const { id: appointmentId } = useParams();
  const detailOpen = Boolean(appointmentId) && appointmentId !== 'new';
  const [scheduleToDelete, setScheduleToDelete] = useState<Appointment | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Appointment['status'] | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const invalidDateRange = Boolean(from && to && from > to);
  const hasActiveFilters = Boolean(status || from || to || doctorId || customerId);
  const doctorOptions = useQuery({
    queryKey: ['doctors', 'scheduleFilter'],
    queryFn: () => api.allDoctors(),
    enabled: user?.role === 'ADMIN',
    staleTime: 60_000,
  });
  const customerOptions = useQuery({
    queryKey: ['customers', 'scheduleFilter'],
    queryFn: () => api.allCustomers(),
    enabled: user?.role === 'ADMIN',
    staleTime: 60_000,
  });
  const schedules = useQuery({
    queryKey: ['schedules', user?.id, page, status, from, to, doctorId, customerId],
    queryFn: () =>
      api.schedules({
        page,
        limit: PAGE_SIZE,
        status: status || undefined,
        doctorId: doctorId || undefined,
        customerId: customerId || undefined,
        from: from ? `${from}T00:00:00.000Z` : undefined,
        to: to ? `${to}T23:59:59.999Z` : undefined,
      }),
    enabled: Boolean(user) && !invalidDateRange,
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
  const columns = useMemo(
    () => [
      appointmentColumn.accessor('scheduledAt', {
        header: 'Jadwal',
        cell: (info) => (
          <span className='font-semibold text-slate-800'>
            {formatDateTime(info.getValue(), { dateStyle: 'full', timeStyle: 'short' })} ·{' '}
            {info.row.original.durationMinutes} menit
          </span>
        ),
      }),
      appointmentColumn.accessor((item) => item.doctor.name, { id: 'doctor', header: 'Dokter' }),
      ...(user?.role !== 'CUSTOMER'
        ? [
            appointmentColumn.accessor((item) => item.customer.name, {
              id: 'customer',
              header: 'Pasien',
            }),
          ]
        : []),
      appointmentColumn.accessor('objective', {
        header: 'Tujuan konsultasi',
        cell: (info) => <span className='line-clamp-2 max-w-xs'>{info.getValue()}</span>,
      }),
      appointmentColumn.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <span className='font-semibold text-slate-700'>{statusLabels[info.getValue()]}</span>
        ),
      }),
      appointmentColumn.display({
        id: 'actions',
        header: 'Aksi',
        cell: (info) => (
          <AppointmentCard
            item={info.row.original}
            role={user?.role ?? 'CUSTOMER'}
            busy={update.isPending || remove.isPending}
            onAction={action}
            onDelete={() => setScheduleToDelete(info.row.original)}
          />
        ),
      }),
    ],
    [user?.role, update.isPending, remove.isPending, action],
  );

  return (
    <>
      <PageHeading
        eyebrow='Janji temu'
        title={user?.role === 'ADMIN' ? 'Semua janji temu' : 'Jadwal saya'}
        description={
          user?.role === 'ADMIN'
            ? 'Lihat dan kelola janji temu klinik.'
            : 'Lihat dan kelola janji temu Anda.'
        }
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
      <section className='mb-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm'>
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(150px,1fr))_auto] xl:items-end'>
          <label className='text-xs font-semibold text-slate-600'>
            Status
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as Appointment['status'] | '');
                setPage(1);
              }}
              className='mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10'
            >
              <option value=''>Semua status</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className='text-xs font-semibold text-slate-600'>
            Dari tanggal
            <input
              type='date'
              value={from}
              max={to || undefined}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              className='mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10'
            />
          </label>
          <label className='text-xs font-semibold text-slate-600'>
            Sampai tanggal
            <input
              type='date'
              value={to}
              min={from || undefined}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
              className='mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10'
            />
          </label>
          {user?.role === 'ADMIN' && (
            <>
              <label className='text-xs font-semibold text-slate-600'>
                Dokter
                <select
                  value={doctorId}
                  onChange={(event) => {
                    setDoctorId(event.target.value);
                    setPage(1);
                  }}
                  className='mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10'
                >
                  <option value=''>Semua dokter</option>
                  {(doctorOptions.data ?? []).map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className='text-xs font-semibold text-slate-600'>
                Customer
                <select
                  value={customerId}
                  onChange={(event) => {
                    setCustomerId(event.target.value);
                    setPage(1);
                  }}
                  className='mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10'
                >
                  <option value=''>Semua customer</option>
                  {(customerOptions.data ?? []).map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} · {customer.email}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <button
            type='button'
            disabled={!status && !from && !to && !doctorId && !customerId}
            onClick={() => {
              setStatus('');
              setFrom('');
              setTo('');
              setDoctorId('');
              setCustomerId('');
              setPage(1);
            }}
            className='h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 disabled:opacity-40'
          >
            Hapus filter
          </button>
        </div>
        {doctorOptions.error && (
          <p role='alert' className='mt-3 text-xs text-rose-700'>
            Gagal memuat daftar dokter: {doctorOptions.error.message}
          </p>
        )}
        {customerOptions.error && (
          <p role='alert' className='mt-3 text-xs text-rose-700'>
            Gagal memuat daftar pasien: {customerOptions.error.message}
          </p>
        )}
        {invalidDateRange && (
          <p role='alert' className='mt-3 text-xs text-rose-700'>
            Tanggal awal harus sebelum atau sama dengan tanggal akhir.
          </p>
        )}
      </section>
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
          <h2 className='font-semibold text-slate-800'>
            {hasActiveFilters ? 'Tidak ada janji temu yang cocok' : 'Belum ada janji temu'}
          </h2>
          <p className='mt-1 text-sm text-slate-500 mb-3'>
            {hasActiveFilters
              ? 'Coba ubah atau hapus filter.'
              : 'Jadwalkan konsultasi dengan dokter pilihan Anda.'}
          </p>
        </div>
      ) : (
        <DataTable
          data={schedules.data.schedules.items}
          columns={columns}
          pageSize={PAGE_SIZE}
          showPagination={false}
          searchPlaceholder='Cari jadwal di halaman ini…'
          emptyMessage='Tidak ada janji temu di halaman ini.'
          getRowId={(item) => item.id}
        />
      )}
      {schedules.data?.schedules && schedules.data.schedules.totalPages > 1 && (
        <div className='mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-xs text-slate-500'>
            Menampilkan {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, schedules.data.schedules.total)} dari{' '}
            {schedules.data.schedules.total} janji temu
          </p>
          <div className='flex items-center justify-between gap-2 sm:justify-end'>
            <button
              type='button'
              disabled={page <= 1 || schedules.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40'
            >
              Sebelumnya
            </button>
            <span className='px-2 text-xs text-slate-500'>
              Halaman {page} dari {schedules.data.schedules.totalPages}
            </span>
            <button
              type='button'
              disabled={page >= schedules.data.schedules.totalPages || schedules.isFetching}
              onClick={() =>
                setPage((current) => Math.min(schedules.data!.schedules.totalPages, current + 1))
              }
              className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40'
            >
              Berikutnya
            </button>
          </div>
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
      {bookingOpen && <BookingView onClose={() => navigate('/appointments', { replace: true })} />}
      {detailOpen && (
        <AppointmentDetailView onClose={() => navigate('/appointments', { replace: true })} />
      )}
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
    <div className='flex min-w-57.5 flex-col items-start gap-2'>
      <Link to={`/appointments/${item.id}`} className='text-xs font-semibold text-rata-red'>
        Detail
      </Link>
      <div className='flex flex-wrap gap-2'>
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
                    {formatDateTime(value, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
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
    </div>
  );
}
