import { useState } from 'react';

import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { api } from '../../data-services/api';
import { useAuth } from '../../data-services/auth-context';
import { saveSession } from '../../data-services/session';
import { AuthShell } from '../../layouts/AuthShell';
import { getFormSubmissionError, setFormSubmissionError } from '../../lib/tanstack-form-errors';
import { loginResolver } from './login/config';

export default function LoginView() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmitAsync: loginResolver },
    onSubmit: async ({ value }) => submitLogin(value),
  });
  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: ({ login: result }) => {
      saveSession({ accessToken: result.accessToken, user: result.user });
      navigate(
        (location.state as { from?: string } | null)?.from ??
          (result.user.role === 'DOCTOR' ? '/my-schedule' : '/doctors'),
        { replace: true },
      );
    },
  });
  if (user) return <Navigate to={user.role === 'DOCTOR' ? '/my-schedule' : '/doctors'} replace />;
  const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10';

  async function submitLogin(values: { email: string; password: string }) {
    try {
      await login.mutateAsync(values);
    } catch (cause) {
      setFormSubmissionError(
        form,
        cause instanceof Error ? cause.message : 'Login belum berhasil. Silakan coba lagi.',
      );
    }
  }

  return (
    <AuthShell mode='login'>
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
        className='space-y-4.5'
      >
        <form.Field name='email'>
          {(field) => (
            <label className='block'>
              <span className='text-xs font-semibold text-slate-700'>Email</span>
              <div className='relative mt-1.5'>
                <Icon
                  name='mail'
                  size={16}
                  className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
                />
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  autoComplete='email'
                  placeholder='nama@klinik.com'
                  className={`${inputClass} pl-10`}
                />
              </div>
              {field.state.meta.errors[0] && (
                <span role='alert' className='mt-1 block text-xs text-rose-700'>
                  {field.state.meta.errors[0].message}
                </span>
              )}
            </label>
          )}
        </form.Field>
        <form.Field name='password'>
          {(field) => (
            <label className='block'>
              <span className='text-xs font-semibold text-slate-700'>Kata sandi</span>
              <div className='relative mt-1.5'>
                <Icon
                  name='lock'
                  size={16}
                  className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
                />
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  placeholder='Masukkan kata sandi'
                  className={`${inputClass} pl-10 pr-11`}
                />
                <button
                  type='button'
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  onClick={() => setShowPassword((value) => !value)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700'
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
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              disabled={isSubmitting}
              type='submit'
              className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rata-red text-sm font-semibold text-white shadow-sm shadow-rose-200 transition-[background-color,transform] duration-150 ease-out hover:bg-rata-red-dark active:scale-[0.99] disabled:opacity-60'
            >
              {isSubmitting ? 'Memeriksa akun…' : 'Masuk ke akun'}
              <Icon name='arrow' size={16} />
            </button>
          )}
        </form.Subscribe>
      </form>
      <p className='mt-7 text-center text-sm text-slate-500'>
        Belum punya akun?{' '}
        <Link
          to='/auth/register'
          className='font-bold text-rata-red transition hover:text-rata-red-dark'
        >
          Daftar sekarang
        </Link>
      </p>
    </AuthShell>
  );
}
