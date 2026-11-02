import { type FormEvent, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Icon } from '../../components/Icon';
import { PageHeading } from '../../components/PageHeading';
import { api } from '../../data-services/api';
import { useAuth } from '../../data-services/auth-context';
import type { User } from '../../data-services/session';

type UserRole = User['role'];
type StaffRole = Exclude<UserRole, 'CUSTOMER'>;
const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10';
const roleLabel: Record<UserRole, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Dokter',
  CUSTOMER: 'Customer',
};

export default function UsersManagementView() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('DOCTOR');
  const [doctorProfileId, setDoctorProfileId] = useState('');
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({});
  const users = useQuery({ queryKey: ['adminUsers'], queryFn: api.adminUsers });
  const unlinkedDoctors = useQuery({ queryKey: ['unlinkedDoctors'], queryFn: api.unlinkedDoctors });
  const create = useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      password: string;
      role: StaffRole;
      doctorProfileId: string;
    }) => {
      const { name, email, password, role, doctorProfileId } = input;
      const { createManagedUser: account } = await api.createManagedUser({
        name,
        email,
        password,
        role,
      });
      let doctorProfileError = '';
      if (role === 'DOCTOR') {
        try {
          if (doctorProfileId === '__new__') {
            await api.createDoctor(name, account.id);
          } else {
            const doctor = unlinkedDoctors.data?.unlinkedDoctors.find(
              (item) => item.id === doctorProfileId,
            );
            if (!doctor)
              throw new Error(
                'Profil dokter yang dipilih sudah tidak tersedia. Muat ulang daftar lalu coba lagi.',
              );
            await api.updateDoctor(doctor.id, doctor.name, account.id);
          }
        } catch (cause) {
          doctorProfileError =
            cause instanceof Error ? cause.message : 'Profil dokter belum berhasil ditautkan.';
        }
      }
      return { account, doctorProfileError };
    },
    onSuccess: async () => {
      setName('');
      setEmail('');
      setPassword('');
      setRole('DOCTOR');
      setDoctorProfileId('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['doctors'] }),
        queryClient.invalidateQueries({ queryKey: ['unlinkedDoctors'] }),
      ]);
    },
  });
  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      api.setUserRole(userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    create.mutate({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      doctorProfileId: doctorProfileId || unlinkedDoctors.data?.unlinkedDoctors[0]?.id || '__new__',
    });
  }

  const createdDoctorError = create.data?.doctorProfileError;

  return (
    <>
      <PageHeading
        eyebrow='Operasional klinik'
        title='Manajemen pengguna'
        description='Buat akun staf klinik dan kelola role pengguna.'
      />

      <div className='grid items-start gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]'>
        <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <h2 className='text-sm font-bold text-slate-800'>Buat akun pengguna</h2>
          <p className='mt-1 text-xs leading-5 text-slate-400'>
            Berikan kata sandi awal kepada pengguna melalui jalur yang aman.
          </p>
          <form onSubmit={submitCreate} className='mt-5 grid gap-4'>
            <label className='text-xs font-semibold text-slate-600'>
              Nama lengkap
              <input
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={`${inputClass} mt-1.5`}
                placeholder='Nama pengguna'
              />
            </label>
            <label className='text-xs font-semibold text-slate-600'>
              Email
              <input
                required
                type='email'
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`${inputClass} mt-1.5`}
                placeholder='nama@klinik.com'
              />
            </label>
            <label className='text-xs font-semibold text-slate-600'>
              Kata sandi awal
              <input
                required
                type='password'
                minLength={8}
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} mt-1.5`}
                placeholder='Minimal 8 karakter'
              />
            </label>
            <label className='text-xs font-semibold text-slate-600'>
              Role akun
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as StaffRole)}
                className={`${inputClass} mt-1.5`}
              >
                <option value='DOCTOR'>Dokter</option>
                <option value='ADMIN'>Admin</option>
              </select>
            </label>
            {role === 'DOCTOR' && (
              <label className='text-xs font-semibold text-slate-600'>
                Profil dokter
                <select
                  value={
                    doctorProfileId || unlinkedDoctors.data?.unlinkedDoctors[0]?.id || '__new__'
                  }
                  onChange={(event) => setDoctorProfileId(event.target.value)}
                  className={`${inputClass} mt-1.5`}
                  disabled={unlinkedDoctors.isLoading}
                >
                  {unlinkedDoctors.data?.unlinkedDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Tautkan ke {doctor.name}
                    </option>
                  ))}
                  <option value='__new__'>Buat profil dokter baru</option>
                </select>
                <span className='mt-1 block font-normal text-slate-400'>
                  {unlinkedDoctors.isError
                    ? 'Daftar profil belum berhasil dimuat.'
                    : 'Pilih profil yang sudah ada agar tidak membuat data dokter duplikat.'}
                </span>
              </label>
            )}
            {create.error && (
              <p role='alert' className='text-xs text-rose-700'>
                {create.error.message}
              </p>
            )}
            {create.isSuccess && (
              <p role='status' className='text-xs text-emerald-700'>
                Akun {create.data?.account.email} berhasil dibuat.
              </p>
            )}
            {create.isSuccess && createdDoctorError && (
              <p role='alert' className='text-xs text-amber-700'>
                Akun dokter sudah dibuat, tetapi profil dokternya gagal ditautkan:{' '}
                {createdDoctorError}
              </p>
            )}
            <button
              disabled={create.isPending}
              className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rata-red px-4 text-sm font-semibold text-white hover:bg-rata-red/90 disabled:opacity-50'
            >
              <Icon name='plus' size={16} />
              {create.isPending ? 'Membuat akun…' : 'Buat akun'}
            </button>
          </form>
        </section>

        <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h2 className='text-sm font-bold text-slate-800'>Daftar akun</h2>
              <p className='mt-1 text-xs text-slate-400'>
                Atur role tanpa perlu mencari UUID akun.
              </p>
            </div>
            <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500'>
              {users.data?.adminUsers.length ?? 0} akun
            </span>
          </div>
          {users.isLoading ? (
            <p
              role='status'
              className='mt-5 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500'
            >
              Memuat akun…
            </p>
          ) : users.error ? (
            <p role='alert' className='mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700'>
              {users.error.message}
            </p>
          ) : !users.data?.adminUsers.length ? (
            <p className='mt-5 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500'>
              Belum ada akun.
            </p>
          ) : (
            <div className='mt-5 space-y-2'>
              {users.data.adminUsers.map((account) => {
                const selectedRole = roleDrafts[account.id] ?? account.role;
                const isSelf = account.id === currentUser?.id;
                return (
                  <div
                    key={account.id}
                    className='grid gap-3 rounded-xl border border-slate-100 p-3 sm:grid-cols-[minmax(0,1fr)_150px_auto] sm:items-center'
                  >
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-semibold text-slate-800'>
                        {account.name || 'Tanpa nama'}{' '}
                        {isSelf && <span className='text-xs text-slate-400'>(Anda)</span>}
                      </p>
                      <p className='mt-1 truncate text-xs text-slate-400'>{account.email}</p>
                    </div>
                    <select
                      aria-label={`Role ${account.email}`}
                      value={selectedRole}
                      disabled={isSelf}
                      onChange={(event) =>
                        setRoleDrafts((previous) => ({
                          ...previous,
                          [account.id]: event.target.value as UserRole,
                        }))
                      }
                      className={inputClass}
                    >
                      {Object.entries(roleLabel).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type='button'
                      disabled={isSelf || selectedRole === account.role || updateRole.isPending}
                      onClick={() => updateRole.mutate({ userId: account.id, role: selectedRole })}
                      className='h-11 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
                    >
                      {updateRole.isPending && updateRole.variables?.userId === account.id
                        ? 'Menyimpan…'
                        : 'Simpan role'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {updateRole.error && (
            <p role='alert' className='mt-4 text-xs text-rose-700'>
              {updateRole.error.message}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
