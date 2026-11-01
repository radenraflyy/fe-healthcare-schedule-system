import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../data-services/auth-context';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, serviceError, retry, user } = useAuth();
  const location = useLocation();
  if (!ready)
    return (
      <div className='grid min-h-screen place-items-center text-sm text-slate-500'>
        Memeriksa sesi…
      </div>
    );
  if (serviceError)
    return (
      <div className='grid min-h-screen place-items-center px-5'>
        <div className='max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm'>
          <p className='font-semibold text-slate-800'>Sesi belum dapat diperiksa</p>
          <p role='alert' className='mt-2 text-sm text-slate-500'>
            {serviceError}
          </p>
          <button
            onClick={retry}
            className='mt-4 rounded-xl bg-rata-red px-4 py-2 text-sm font-semibold text-white'
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  if (!user) return <Navigate to='/auth/login' replace state={{ from: location.pathname }} />;
  return children;
}
