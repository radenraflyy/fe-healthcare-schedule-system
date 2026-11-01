import type { ReactNode } from 'react';

import { Icon } from '../components/Icon';

export function AuthShell({ children, mode }: { children: ReactNode; mode: 'login' | 'register' }) {
  const title = mode === 'login' ? 'Selamat datang kembali' : 'Mulai kelola klinik Anda';
  const subtitle =
    mode === 'login'
      ? 'Masuk ke akun portal klinik untuk melanjutkan.'
      : 'Buat akun untuk mengakses portal Klinik Rata.';
  const eyebrow = mode === 'login' ? 'Portal Klinik Rata' : 'Bergabung dengan Rata';

  return (
    <main className='flex min-h-screen bg-white font-sans text-rata-ink'>
      <section className='flex min-h-screen flex-1 flex-col px-5 py-6 sm:px-10 lg:px-12'>
        <div className='flex flex-1 items-center justify-center py-10'>
          <div className='w-full max-w-[420px]'>
            <div className='mb-8'>
              <p className='mb-2 text-xs font-bold uppercase tracking-[0.13em] text-rata-red'>
                {eyebrow}
              </p>
              <h2 className='text-[28px] font-bold tracking-[-0.045em] text-slate-900'>{title}</h2>
              <p className='mt-2 text-sm leading-6 text-slate-500'>{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

export function AuthNotice({ children }: { children: ReactNode }) {
  return (
    <div
      role='status'
      className='mb-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-900'
    >
      <Icon name='help' size={16} className='mt-0.5 shrink-0 text-amber-700' />
      {children}
    </div>
  );
}
