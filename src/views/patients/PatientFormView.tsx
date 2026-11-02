import { useEffect } from 'react';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { PageHeading } from '../../components/PageHeading';
import { PrimaryButton } from '../../components/PrimaryButton';
import { type CustomerInput, type CustomerStatus, api } from '../../data-services/api';
import { useAuth } from '../../data-services/auth-context';
import { getFormSubmissionError, setFormSubmissionError } from '../../lib/tanstack-form-errors';
import { patientResolver } from './config';

const inputClass =
  'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10';
const errorClass = 'mt-1 block text-xs font-normal text-rose-700';
function toLocalDateTime(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function PatientFormView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const detail = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.customer(id!),
    enabled: Boolean(id),
  });
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: null as 'Perempuan' | 'Laki-laki' | 'Lainnya' | null,
      birthDate: '',
      address: '',
      treatment: '',
      status: null as CustomerStatus | null,
      nextVisit: '',
      note: '',
    },
    validators: { onSubmitAsync: patientResolver },
    onSubmit: async ({ value }) => submit(value),
  });
  useEffect(() => {
    const patient = detail.data?.customer;
    if (!patient) return;
    form.reset({
      name: patient.name,
      email: patient.email,
      phone: patient.phone ?? '',
      gender: patient.gender as 'Perempuan' | 'Laki-laki' | 'Lainnya' | null,
      birthDate: patient.birthDate?.slice(0, 10) ?? '',
      address: patient.address ?? '',
      treatment: patient.treatment ?? '',
      status: patient.status,
      nextVisit: toLocalDateTime(patient.nextVisit),
      note: patient.note ?? '',
    });
  }, [detail.data, form]);
  const save = useMutation({
    mutationFn: async (input: CustomerInput) => {
      const result = isEditing
        ? await api.updateCustomer(id!, input)
        : await api.createCustomer(input);
      return 'createCustomer' in result ? result.createCustomer : result.updateCustomer;
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['customersSearch'] });
      await queryClient.invalidateQueries({ queryKey: ['schedules'] });
      await queryClient.invalidateQueries({ queryKey: ['calendarSchedules'] });
      queryClient.setQueryData(['customer', result.id], { customer: result });
      navigate(`/patients/${result.id}`, {
        state: { success: 'Profil pasien berhasil disimpan.' },
      });
    },
  });
  if (user?.role !== 'ADMIN') return <Navigate to='/appointments' replace />;
  if (id && detail.isLoading)
    return (
      <p role='status' className='rounded-2xl bg-white p-8 text-center text-sm text-slate-500'>
        Memuat profil pasien…
      </p>
    );
  if (id && detail.error)
    return (
      <p role='alert' className='rounded-2xl bg-white p-8 text-center text-sm text-rose-700'>
        {detail.error.message}
      </p>
    );
  if (id && !detail.data?.customer) return <Navigate to='/patients' replace />;

  async function submit(values: {
    name: string;
    email: string;
    phone: string;
    gender: 'Perempuan' | 'Laki-laki' | 'Lainnya' | null;
    birthDate: string;
    address: string;
    treatment: string;
    status: CustomerStatus | null;
    nextVisit: string;
    note: string;
  }) {
    const nextVisit = values.nextVisit ? new Date(values.nextVisit).toISOString() : null;
    try {
      await save.mutateAsync({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone || null,
        gender: values.gender || null,
        birthDate: values.birthDate || null,
        address: values.address || null,
        treatment: values.treatment || null,
        status: values.status || null,
        nextVisit,
        note: values.note || null,
      } as CustomerInput);
    } catch (cause) {
      setFormSubmissionError(
        form,
        cause instanceof Error ? cause.message : 'Profil pasien gagal disimpan. Silakan coba lagi.',
      );
    }
  }

  return (
    <>
      <Link
        to={id ? `/patients/${id}` : '/patients'}
        className='mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-rata-red'
      >
        <Icon name='back' size={15} />
        Kembali
      </Link>
      <PageHeading
        eyebrow='Data pasien'
        title={isEditing ? 'Edit Pasien' : 'Tambah Pasien'}
        description='Kelola kontak, informasi perawatan, dan kunjungan pasien.'
      />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className='max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7'
      >
        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(error) => {
            const message = getFormSubmissionError(error);
            return message ? (
              <div
                role='alert'
                className='mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'
              >
                {message}
              </div>
            ) : null;
          }}
        </form.Subscribe>
        <div className='grid gap-5 sm:grid-cols-2'>
          <form.Field name='name'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-600'>
                Nama lengkap
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClass}
                  placeholder='Nama pasien'
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className={errorClass}>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          <form.Field name='email'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-600'>
                Email
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  type='email'
                  className={inputClass}
                  placeholder='nama@email.com'
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className={errorClass}>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          <form.Field name='phone'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-600'>
                Nomor telepon
                <input
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  type='tel'
                  className={inputClass}
                  placeholder='+62…'
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className={errorClass}>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          <form.Field name='gender'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-600'>
                Jenis kelamin
                <select
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange((event.target.value || null) as typeof field.state.value)
                  }
                  className={inputClass}
                >
                  <option value=''>Belum diisi</option>
                  <option value='Perempuan'>Perempuan</option>
                  <option value='Laki-laki'>Laki-laki</option>
                  <option value='Lainnya'>Lainnya</option>
                </select>
                {field.state.meta.errors[0] && (
                  <span role='alert' className={errorClass}>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          <form.Field name='birthDate'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-600'>
                Tanggal lahir
                <input
                  name={field.name}
                  type='date'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClass}
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className={errorClass}>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          <form.Field name='status'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-600'>
                Status perawatan
                <select
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange((event.target.value || null) as typeof field.state.value)
                  }
                  className={inputClass}
                >
                  <option value=''>Belum diatur</option>
                  <option value='ACTIVE'>Aktif</option>
                  <option value='WAITING'>Menunggu</option>
                  <option value='COMPLETED'>Selesai</option>
                </select>
                {field.state.meta.errors[0] && (
                  <span role='alert' className={errorClass}>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          <form.Field name='address'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-600 sm:col-span-2'>
                Alamat
                <textarea
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  rows={2}
                  placeholder='Alamat pasien'
                  className={`${inputClass} h-auto py-3`}
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className={errorClass}>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          <form.Field name='treatment'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-600'>
                Jenis perawatan
                <input
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClass}
                  placeholder='Contoh: konsultasi umum'
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className={errorClass}>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          <form.Field name='nextVisit'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-600'>
                Kunjungan berikutnya
                <input
                  name={field.name}
                  type='datetime-local'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClass}
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className={errorClass}>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          <form.Field name='note'>
            {(field) => (
              <label className='block text-xs font-semibold text-slate-600 sm:col-span-2'>
                Catatan
                <textarea
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  rows={4}
                  placeholder='Catatan untuk tim klinik'
                  className={`${inputClass} h-auto py-3`}
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className={errorClass}>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
        </div>
        <div className='mt-7 flex flex-col-reverse justify-end gap-2 sm:flex-row'>
          <Link
            to={id ? `/patients/${id}` : '/patients'}
            className='inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
          >
            Batal
          </Link>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <PrimaryButton type='submit' disabled={isSubmitting}>
                <Icon name='check' size={17} />
                {isSubmitting ? 'Loading...' : isEditing ? 'Ubah' : 'Submit'}
              </PrimaryButton>
            )}
          </form.Subscribe>
        </div>
      </form>
    </>
  );
}
