import { useEffect, useState } from 'react';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Icon } from '../../components/Icon';
import { PageHeading } from '../../components/PageHeading';
import { PrimaryButton } from '../../components/PrimaryButton';
import { type Doctor, api } from '../../data-services/api';
import { useAuth } from '../../data-services/auth-context';
import { getFormSubmissionError, setFormSubmissionError } from '../../lib/tanstack-form-errors';
import { doctorAvailabilityResolver, doctorResolver } from './management/config';

const field =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10';
const fieldError = 'mt-1 block text-xs font-normal text-rose-700';
const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function DoctorManagementView() {
  const { user } = useAuth();
  const cache = useQueryClient();
  const [doctorPage, setDoctorPage] = useState(1);
  const [selectedId, setSelectedId] = useState('');
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [disconnectDoctor, setDisconnectDoctor] = useState(false);
  const doctors = useQuery({
    queryKey: ['doctors', 'management', doctorPage],
    queryFn: () => api.doctors(doctorPage, 12),
    staleTime: 30_000,
  });
  const doctorItems = doctors.data?.doctors.items ?? [];
  const currentId = selectedId || doctorItems[0]?.id || '';
  const selectedDoctor = useQuery({
    queryKey: ['doctor', currentId],
    queryFn: () => api.doctor(currentId),
    enabled: Boolean(currentId),
  });
  const windows = useQuery({
    queryKey: ['doctorAvailabilities', currentId],
    queryFn: () => api.doctorAvailabilities(currentId),
    enabled: Boolean(currentId),
  });
  const doctorForm = useForm({
    defaultValues: { name: '', userId: '' },
    validators: { onSubmitAsync: doctorResolver },
    onSubmit: async ({ value }) => doctorSubmit(value),
  });
  const availabilityForm = useForm({
    defaultValues: {
      doctorId: currentId,
      dayOfWeek: 0,
      startTime: '',
      endTime: '',
      slotMinutes: 30,
    },
    validators: { onSubmitAsync: doctorAvailabilityResolver },
    onSubmit: async ({ value }) => availabilitySubmit(value),
  });
  useEffect(() => {
    availabilityForm.reset({
      doctorId: currentId,
      dayOfWeek: 0,
      startTime: '',
      endTime: '',
      slotMinutes: 30,
    });
  }, [currentId, availabilityForm]);

  const refresh = async () =>
    Promise.all([
      cache.invalidateQueries({ queryKey: ['doctors'] }),
      cache.invalidateQueries({ queryKey: ['doctor'] }),
      cache.invalidateQueries({ queryKey: ['doctorAvailabilities'] }),
      cache.invalidateQueries({ queryKey: ['slots'] }),
    ]);
  const saveDoctor = useMutation({
    mutationFn: async ({ name, userId }: { name: string; userId?: string | null }) => {
      const result = editing
        ? await api.updateDoctor(editing.id, name, userId)
        : await api.createDoctor(name, userId ?? null);
      return 'createDoctor' in result ? result.createDoctor : result.updateDoctor;
    },
    onSuccess: async () => {
      setEditing(null);
      setDisconnectDoctor(false);
      setDoctorName('');
      doctorForm.reset({ name: '', userId: '' });
      await refresh();
    },
  });
  const removeDoctor = useMutation({
    mutationFn: api.deleteDoctor,
    onSuccess: async (_result, id) => {
      if (currentId === id) setSelectedId('');
      await refresh();
    },
  });
  const addWindow = useMutation({ mutationFn: api.setDoctorAvailability, onSuccess: refresh });
  const removeWindow = useMutation({
    mutationFn: api.deleteDoctorAvailability,
    onSuccess: refresh,
  });
  const actionError = removeDoctor.error?.message ?? removeWindow.error?.message;

  if (user?.role !== 'ADMIN') return <Navigate to='/doctors' replace />;

  async function doctorSubmit(values: { name: string; userId?: string | null }) {
    try {
      await saveDoctor.mutateAsync({
        name: values.name.trim(),
        userId: disconnectDoctor ? null : values.userId || (editing ? undefined : null),
      });
    } catch (cause) {
      setFormSubmissionError(
        doctorForm,
        cause instanceof Error ? cause.message : 'Profil dokter gagal disimpan.',
      );
    }
  }
  async function availabilitySubmit(values: {
    doctorId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotMinutes: number;
  }) {
    try {
      await addWindow.mutateAsync({ ...values, doctorId: currentId });
      availabilityForm.reset({
        doctorId: currentId,
        dayOfWeek: 0,
        startTime: '',
        endTime: '',
        slotMinutes: 30,
      });
    } catch (cause) {
      setFormSubmissionError(
        availabilityForm,
        cause instanceof Error ? cause.message : 'Jam praktik gagal disimpan.',
      );
    }
  }
  function startCreateDoctor() {
    setEditing(null);
    setDisconnectDoctor(false);
    setDoctorName('');
    doctorForm.reset({ name: '', userId: '' });
  }
  function startEditDoctor(doctor: Doctor) {
    setEditing(doctor);
    setDisconnectDoctor(false);
    setDoctorName(doctor.name);
    doctorForm.reset({ name: doctor.name, userId: '' });
  }

  return (
    <>
      <PageHeading
        eyebrow='Operasional klinik'
        title='Dokter & Jam Praktik'
        description='Kelola profil dokter, hubungkan akun, atur jam praktik mingguan, dan role akun.'
      />
      {actionError && (
        <p
          role='alert'
          className='mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'
        >
          {actionError}
        </p>
      )}
      <div className='grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]'>
        <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='mb-5 flex items-center justify-between'>
            <div>
              <h2 className='text-sm font-bold text-slate-800'>Daftar dokter</h2>
              <p className='mt-1 text-xs text-slate-400'>
                Akun yang terhubung dapat memperbarui jadwalnya sendiri.
              </p>
            </div>
            <PrimaryButton onClick={startCreateDoctor}>
              <Icon name='plus' size={16} />
              Tambah dokter
            </PrimaryButton>
          </div>
          {doctors.isLoading ? (
            <p role='status' className='py-8 text-center text-sm text-slate-500'>
              Memuat dokter…
            </p>
          ) : doctors.error ? (
            <p role='alert' className='py-5 text-sm text-rose-700'>
              {doctors.error.message}
            </p>
          ) : !doctorItems.length ? (
            <p className='rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500'>
              Belum ada dokter.
            </p>
          ) : (
            <div className='mb-5 space-y-2'>
              {doctorItems.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${currentId === doctor.id ? 'border-rata-red/30 bg-rose-50/50' : 'border-slate-100'}`}
                >
                  <button
                    type='button'
                    onClick={() => setSelectedId(doctor.id)}
                    className='min-w-0 flex-1 text-left'
                  >
                    <p className='truncate text-sm font-semibold text-slate-800'>{doctor.name}</p>
                    <p className='mt-1 truncate text-[11px] text-slate-400'>
                      {currentId === doctor.id && selectedDoctor.data?.doctor
                        ? 'Profil dokter'
                        : 'Pilih untuk melihat profil'}
                    </p>
                  </button>
                  <button
                    type='button'
                    aria-label={`Edit ${doctor.name}`}
                    onClick={() => startEditDoctor(doctor)}
                    className='rounded-lg p-2 text-slate-500 hover:bg-white hover:text-rata-red'
                  >
                    <Icon name='edit' size={15} />
                  </button>
                  <button
                    type='button'
                    aria-label={`Hapus ${doctor.name}`}
                    disabled={removeDoctor.isPending}
                    onClick={() => setDoctorToDelete(doctor)}
                    className='rounded-lg p-2 text-slate-500 hover:bg-white hover:text-rose-700 disabled:opacity-50'
                  >
                    <Icon name='trash' size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {!doctors.isLoading &&
            !doctors.error &&
            doctors.data &&
            doctors.data.doctors.totalPages > 1 && (
              <div className='mb-5 flex items-center justify-between gap-2'>
                <p className='text-[11px] text-slate-400'>
                  {doctors.data.doctors.total} dokter · halaman {doctorPage} dari{' '}
                  {doctors.data.doctors.totalPages}
                </p>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    disabled={doctorPage <= 1 || doctors.isFetching}
                    onClick={() => setDoctorPage((current) => Math.max(1, current - 1))}
                    className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40'
                  >
                    Sebelumnya
                  </button>
                  <button
                    type='button'
                    disabled={doctorPage >= doctors.data.doctors.totalPages || doctors.isFetching}
                    onClick={() =>
                      setDoctorPage((current) =>
                        Math.min(doctors.data!.doctors.totalPages, current + 1),
                      )
                    }
                    className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40'
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void doctorForm.handleSubmit();
            }}
            className='grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2'
          >
            <h3 className='text-xs font-bold text-slate-700 sm:col-span-2'>
              {editing ? 'Edit profil dokter' : 'Tambah profil dokter'}
            </h3>
            <doctorForm.Subscribe selector={(state) => state.errorMap.onSubmit}>
              {(error) => {
                const message = getFormSubmissionError(error);
                return message ? (
                  <p role='alert' className='text-xs text-rose-700 sm:col-span-2'>
                    {message}
                  </p>
                ) : null;
              }}
            </doctorForm.Subscribe>
            <doctorForm.Field name='name'>
              {(fieldApi) => (
                <label className='text-xs font-semibold text-slate-600 sm:col-span-2'>
                  Nama dokter
                  <input
                    name={fieldApi.name}
                    value={doctorName}
                    onBlur={fieldApi.handleBlur}
                    onChange={(event) => {
                      const name = event.target.value;
                      setDoctorName(name);
                      fieldApi.handleChange(name);
                    }}
                    className={`${field} mt-1.5`}
                  />
                  {fieldApi.state.meta.errors[0] && (
                    <span role='alert' className={fieldError}>
                      {fieldApi.state.meta.errors[0].message}
                    </span>
                  )}
                </label>
              )}
            </doctorForm.Field>
            {editing && (
              <label className='flex items-center gap-2 text-xs text-slate-600 sm:col-span-2'>
                <input
                  type='checkbox'
                  checked={disconnectDoctor}
                  onChange={(event) => setDisconnectDoctor(event.target.checked)}
                />
                Putuskan kontrak
              </label>
            )}
            <div className='flex gap-2 sm:col-span-2'>
              <doctorForm.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <button
                    disabled={isSubmitting}
                    className='rounded-xl bg-rata-red px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50'
                  >
                    {isSubmitting ? 'Loading...' : editing ? 'Ubah' : 'Submit dokter'}
                  </button>
                )}
              </doctorForm.Subscribe>
              {editing && (
                <button
                  type='button'
                  onClick={() => setEditing(null)}
                  className='rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600'
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>
        <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <h2 className='text-sm font-bold text-slate-800'>Jam praktik mingguan</h2>
          <p className='mt-1 text-xs text-slate-400'>
            Hari dan jam disimpan dalam UTC. Slot dipakai pada alur booking.
          </p>
          {doctorItems.length > 0 && (
            <label className='mt-4 block text-xs font-semibold text-slate-600'>
              Dokter
              <select
                value={currentId}
                onChange={(event) => setSelectedId(event.target.value)}
                className={`${field} mt-1.5`}
              >
                {doctorItems.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {!currentId ? (
            <p className='mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500'>
              Tambahkan dokter untuk mengatur jam praktik.
            </p>
          ) : (
            <>
              <p className='mt-3 text-[11px] text-slate-400'>
                {selectedDoctor.isLoading
                  ? 'Memuat detail…'
                  : selectedDoctor.data?.doctor
                    ? `Dibuat ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(selectedDoctor.data.doctor.createdAt ?? ''))}`
                    : ''}
              </p>
              <div className='my-4'>
                {windows.isLoading ? (
                  <p role='status' className='py-4 text-sm text-slate-500'>
                    Memuat jam praktik…
                  </p>
                ) : windows.error ? (
                  <p role='alert' className='py-3 text-sm text-rose-700'>
                    {windows.error.message}
                  </p>
                ) : !windows.data?.doctorAvailabilities.length ? (
                  <p className='rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500'>
                    Belum ada jam praktik.
                  </p>
                ) : (
                  <ul className='divide-y divide-slate-100'>
                    {windows.data.doctorAvailabilities.map((item) => (
                      <li key={item.id} className='flex items-center justify-between gap-3 py-3'>
                        <span>
                          <strong className='block text-sm text-slate-700'>
                            {days[item.dayOfWeek]}
                          </strong>
                          <span className='text-xs text-slate-500'>
                            {item.startTime}–{item.endTime} UTC · slot {item.slotMinutes} menit
                          </span>
                        </span>
                        <button
                          type='button'
                          aria-label={`Hapus jam ${days[item.dayOfWeek]}`}
                          disabled={removeWindow.isPending}
                          onClick={() => removeWindow.mutate(item.id)}
                          className='rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50'
                        >
                          <Icon name='trash' size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void availabilityForm.handleSubmit();
                }}
                className='grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2'
              >
                <h3 className='text-xs font-bold text-slate-700 sm:col-span-2'>
                  Tambah rentang jam praktik
                </h3>
                <availabilityForm.Subscribe selector={(state) => state.errorMap.onSubmit}>
                  {(error) => {
                    const message = getFormSubmissionError(error);
                    return message ? (
                      <p role='alert' className='text-xs text-rose-700 sm:col-span-2'>
                        {message}
                      </p>
                    ) : null;
                  }}
                </availabilityForm.Subscribe>
                <availabilityForm.Field name='dayOfWeek'>
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
                        <span role='alert' className={fieldError}>
                          {fieldApi.state.meta.errors[0].message}
                        </span>
                      )}
                    </label>
                  )}
                </availabilityForm.Field>
                <availabilityForm.Field name='slotMinutes'>
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
                        {[15, 20, 30, 45, 60].map((value) => (
                          <option key={value} value={value}>
                            {value} menit
                          </option>
                        ))}
                      </select>
                      {fieldApi.state.meta.errors[0] && (
                        <span role='alert' className={fieldError}>
                          {fieldApi.state.meta.errors[0].message}
                        </span>
                      )}
                    </label>
                  )}
                </availabilityForm.Field>
                <availabilityForm.Field name='startTime'>
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
                        <span role='alert' className={fieldError}>
                          {fieldApi.state.meta.errors[0].message}
                        </span>
                      )}
                    </label>
                  )}
                </availabilityForm.Field>
                <availabilityForm.Field name='endTime'>
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
                        <span role='alert' className={fieldError}>
                          {fieldApi.state.meta.errors[0].message}
                        </span>
                      )}
                    </label>
                  )}
                </availabilityForm.Field>
                <availabilityForm.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <button
                      disabled={isSubmitting}
                      className='rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50 sm:col-span-2'
                    >
                      {isSubmitting ? 'Menyimpan…' : 'Tambah jam praktik'}
                    </button>
                  )}
                </availabilityForm.Subscribe>
              </form>
            </>
          )}
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(doctorToDelete)}
        title='Hapus profil dokter?'
        description={
          doctorToDelete
            ? `Hapus dokter ${doctorToDelete.name}? Dokter dengan jadwal terkait tidak dapat dihapus.`
            : ''
        }
        confirmLabel='Hapus dokter'
        pending={removeDoctor.isPending}
        onCancel={() => setDoctorToDelete(null)}
        onConfirm={() => {
          if (!doctorToDelete) return;
          removeDoctor.mutate(doctorToDelete.id, {
            onSettled: () => setDoctorToDelete(null),
          });
        }}
      />
    </>
  );
}
