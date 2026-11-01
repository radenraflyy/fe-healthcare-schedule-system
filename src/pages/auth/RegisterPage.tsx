import { useState } from 'react';

import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { api } from '../../data-services/api';
import { AuthNotice, AuthShell } from '../../layouts/AuthShell';
import { getFormSubmissionError, setFormSubmissionError } from '../../lib/tanstack-form-errors';
import { registerResolver } from '../../views/auth/register/config';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', accepted: false },
    validators: { onSubmit: registerResolver },
    onSubmit: async ({ value }) => submitRegister(value),
  });
  const registration = useMutation({
    mutationFn: ({
      email,
      password,
      name,
    }: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      accepted: boolean;
    }) => api.register(email, password, name),
    onSuccess: () => form.reset(),
  });
  const inputClass =
    'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10';

  async function submitRegister(values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    accepted: boolean;
  }) {
    try {
      await registration.mutateAsync(values);
    } catch (cause) {
      setFormSubmissionError(
        form,
        cause instanceof Error ? cause.message : 'Registrasi belum berhasil. Silakan coba lagi.',
      );
    }
  }

  return (
    <AuthShell mode='register'>
      {registration.isSuccess && (
        <AuthNotice>
          Akun berhasil dibuat. Silakan masuk menggunakan email dan kata sandi Anda.
        </AuthNotice>
      )}
      <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
        {(error) => {
          const message = getFormSubmissionError(error);
          return message ? (
            <div
              role='alert'
              className='mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-700'
            >
              {message}
            </div>
          ) : null;
        }}
      </form.Subscribe>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className='space-y-3.5'
      >
        <form.Field name='name'>
          {(field) => (
            <label className='block'>
              <span className='text-xs font-semibold text-slate-700'>Nama lengkap</span>
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                autoComplete='name'
                placeholder='Nama Anda'
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
        <form.Field name='email'>
          {(field) => (
            <label className='block'>
              <span className='text-xs font-semibold text-slate-700'>Email</span>
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                type='email'
                autoComplete='email'
                placeholder='nama@klinik.com'
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
        <div className='grid gap-3 sm:grid-cols-2'>
          <form.Field name='password'>
            {(field) => (
              <label className='block'>
                <span className='text-xs font-semibold text-slate-700'>Kata sandi</span>
                <div className='relative'>
                  <input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    placeholder='Min. 8 karakter'
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type='button'
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    onClick={() => setShowPassword((value) => !value)}
                    className='absolute right-3 top-[23px] rounded-md p-1 text-slate-400 transition hover:text-slate-700'
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
                  </button>
                </div>
                {field.state.meta.errors[0] && (
                  <span role='alert' className='mt-1 block text-xs text-rose-700'>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </label>
            )}
          </form.Field>
          <form.Field name='confirmPassword'>
            {(field) => (
              <label className='block'>
                <span className='text-xs font-semibold text-slate-700'>Konfirmasi kata sandi</span>
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  placeholder='Ulangi kata sandi'
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
        <form.Field name='accepted'>
          {(field) => (
            <>
              <label className='flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-5 text-slate-500'>
                <input
                  type='checkbox'
                  checked={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.checked)}
                  className='mt-1 size-3.5 shrink-0 rounded border-slate-300 accent-rata-red'
                />
                <span>
                  Saya menyetujui{' '}
                  <a
                    href='#syarat'
                    className='font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2'
                  >
                    Syarat &amp; Ketentuan
                  </a>{' '}
                  dan{' '}
                  <a
                    href='#privasi'
                    className='font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2'
                  >
                    Kebijakan Privasi
                  </a>
                  .
                </span>
              </label>
              {field.state.meta.errors[0] && (
                <p role='alert' className='text-xs text-rose-700'>
                  {field.state.meta.errors[0].message}
                </p>
              )}
            </>
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              disabled={isSubmitting || registration.isSuccess}
              type='submit'
              className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rata-red text-sm font-semibold text-white shadow-sm shadow-rose-200 transition-[background-color,transform] duration-150 ease-out hover:bg-rata-red-dark active:scale-[0.99] disabled:opacity-60'
            >
              {isSubmitting
                ? 'Membuat akun…'
                : registration.isSuccess
                  ? 'Akun berhasil dibuat'
                  : 'Buat akun'}
              <Icon name='arrow' size={16} />
            </button>
          )}
        </form.Subscribe>
      </form>
      <p className='mt-5 text-center text-sm text-slate-500'>
        Sudah punya akun?{' '}
        <Link
          to='/auth/login'
          className='font-bold text-rata-red transition hover:text-rata-red-dark'
        >
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
}
