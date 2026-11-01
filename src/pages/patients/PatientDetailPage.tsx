import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { Avatar } from '../../components/Avatar';
import { Icon } from '../../components/Icon';
import { PageHeading } from '../../components/PageHeading';
import { PrimaryButton } from '../../components/PrimaryButton';
import { api } from '../../data-services/api';
import { useAuth } from '../../data-services/auth-context';

export default function PatientDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const patient = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.customer(id),
    enabled: Boolean(id),
  });
  const appointments = useQuery({
    queryKey: ['customerAppointments', id],
    queryFn: () => api.schedules({ page: 1, limit: 100, customerId: id }),
    enabled: Boolean(id && user?.role === 'ADMIN'),
  });
  const removePatient = useMutation({
    mutationFn: () => api.deleteCustomer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['customersSearch'] });
      navigate('/patients', {
        replace: true,
        state: { success: 'Profil pasien berhasil dihapus.' },
      });
    },
  });
  if (user?.role !== 'ADMIN') return <Navigate to='/appointments' replace />;
  if (patient.isLoading)
    return (
      <p role='status' className='rounded-2xl bg-white p-8 text-center text-sm text-slate-500'>
        Memuat profil pasien…
      </p>
    );
  if (patient.error)
    return (
      <p role='alert' className='rounded-2xl bg-white p-8 text-center text-sm text-rose-700'>
        {patient.error.message}
      </p>
    );
  if (!patient.data?.customer) return <Navigate to='/patients' replace />;
  const item = patient.data.customer;
  return (
    <>
      <Link
        to='/patients'
        className='mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-rata-red'
      >
        <Icon name='back' size={15} />
        Kembali ke daftar pasien
      </Link>
      {(location.state as { success?: string } | null)?.success && (
        <p
          role='status'
          className='mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'
        >
          {(location.state as { success: string }).success}
        </p>
      )}
      <PageHeading
        eyebrow='Profil pasien'
        title={item.name}
        description={`ID pasien ${item.id} · Terdaftar ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(item.createdAt))}`}
        action={
          <div className='flex flex-wrap gap-2'>
            <PrimaryButton to={`/patients/${item.id}/edit`}>
              <Icon name='edit' size={16} />
              Edit pasien
            </PrimaryButton>
            <button
              type='button'
              disabled={removePatient.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    'Hapus profil pasien ini? Profil dengan jadwal terkait tidak dapat dihapus.',
                  )
                )
                  removePatient.mutate();
              }}
              className='inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50'
            >
              {removePatient.isPending ? 'Menghapus…' : 'Hapus pasien'}
            </button>
          </div>
        }
      />
      {removePatient.error && (
        <p
          role='alert'
          className='mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'
        >
          {removePatient.error.message}
        </p>
      )}
      <div className='grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(290px,0.8fr)]'>
        <section className='rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6'>
          <div className='flex items-center gap-4'>
            <Avatar name={item.name} size='lg' />
            <div className='min-w-0'>
              <h2 className='text-lg font-bold text-slate-900'>{item.name}</h2>
              <p className='mt-1 break-all text-sm text-slate-500'>{item.email}</p>
            </div>
          </div>
          <div className='my-5 h-px bg-slate-100' />
          <dl className='grid gap-4 sm:grid-cols-2'>
            {[
              ['Telepon', item.phone],
              ['Jenis kelamin', item.gender],
              [
                'Tanggal lahir',
                item.birthDate
                  ? new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(
                      new Date(item.birthDate),
                    )
                  : null,
              ],
              ['Status perawatan', item.status],
              ['Alamat', item.address],
              ['Perawatan', item.treatment],
              [
                'Kunjungan berikutnya',
                item.nextVisit
                  ? new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    }).format(new Date(item.nextVisit))
                  : null,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className='text-xs text-slate-400'>{label}</dt>
                <dd className='mt-1 break-words text-sm text-slate-700'>
                  {value || 'Belum diisi'}
                </dd>
              </div>
            ))}
            <div className='sm:col-span-2'>
              <dt className='text-xs text-slate-400'>Catatan</dt>
              <dd className='mt-1 whitespace-pre-wrap text-sm text-slate-700'>
                {item.note || 'Belum ada catatan'}
              </dd>
            </div>
            <div>
              <dt className='text-xs text-slate-400'>Dibuat</dt>
              <dd className='mt-1 text-sm text-slate-700'>
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'long',
                  timeStyle: 'short',
                }).format(new Date(item.createdAt))}
              </dd>
            </div>
            <div>
              <dt className='text-xs text-slate-400'>Terakhir diperbarui</dt>
              <dd className='mt-1 text-sm text-slate-700'>
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'long',
                  timeStyle: 'short',
                }).format(new Date(item.updatedAt))}
              </dd>
            </div>
          </dl>
        </section>
        <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm'>
          <div className='border-b border-slate-100 px-5 py-4'>
            <h2 className='text-sm font-bold text-slate-800'>Jadwal pasien</h2>
            <p className='mt-1 text-xs text-slate-400'>
              Janji temu yang terkait dengan profil ini.
            </p>
          </div>
          {appointments.isLoading ? (
            <p role='status' className='p-5 text-sm text-slate-500'>
              Memuat jadwal…
            </p>
          ) : appointments.error ? (
            <p role='alert' className='p-5 text-sm text-rose-700'>
              {appointments.error.message}
            </p>
          ) : !appointments.data?.schedules.items.length ? (
            <p className='p-6 text-center text-sm text-slate-500'>Belum ada janji temu.</p>
          ) : (
            <ul className='divide-y divide-slate-100'>
              {appointments.data.schedules.items.map((schedule) => (
                <li key={schedule.id} className='px-5 py-4'>
                  <Link to={`/appointments/${schedule.id}`} className='font-semibold text-rata-red'>
                    {schedule.doctor.name}
                  </Link>
                  <p className='mt-1 text-xs text-slate-500'>
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(schedule.scheduledAt))}
                  </p>
                  <span className='mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600'>
                    {schedule.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
