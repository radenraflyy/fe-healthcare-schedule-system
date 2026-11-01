import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'

function AuthBrand() {
  return <Link to="/auth/login" aria-label="Rata Clinic Portal" className="inline-flex items-center gap-3">
    <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm"><img src="/favicon.ico" alt="" width={28} height={28} className="size-7 object-contain" /></div>
    <div><div className="text-lg font-bold tracking-[-0.04em] text-slate-900">rata<span className="text-rata-red">.</span></div><div className="-mt-0.5 text-[9px] font-semibold tracking-[0.14em] text-slate-400">CLINIC PORTAL</div></div>
  </Link>
}

export function AuthShell({ children, mode }: { children: ReactNode; mode: 'login' | 'register' }) {
  const title = mode === 'login' ? 'Selamat datang kembali' : 'Mulai kelola klinik Anda'
  const subtitle = mode === 'login' ? 'Masuk ke akun portal klinik untuk melanjutkan.' : 'Buat akun untuk mengakses portal Klinik Rata.'
  return <main className="flex min-h-screen bg-white font-sans text-rata-ink">
    <section className="relative hidden w-[43%] max-w-[640px] flex-col overflow-hidden bg-gradient-to-br from-[#b90d20] via-[#a30e20] to-[#771426] px-10 py-9 text-white lg:flex xl:px-14">
      <div className="pointer-events-none absolute -right-36 -top-28 size-[470px] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-12 -top-10 size-[330px] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-36 size-[430px] rounded-full bg-white/[0.04]" />
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white"><img src="/favicon.ico" alt="" width={28} height={28} className="size-7 object-contain" /></div>
        <div><div className="text-lg font-bold tracking-[-0.04em]">rata<span className="text-rose-200">.</span></div><div className="-mt-0.5 text-[9px] font-medium tracking-[0.14em] text-white/60">CLINIC PORTAL</div></div>
      </div>
      <div className="relative z-10 my-auto max-w-[430px] py-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/90"><Icon name="shield" size={14} />Portal operasional klinik</div>
        <h1 className="text-4xl font-semibold leading-[1.13] tracking-[-0.045em] xl:text-[44px]">Perawatan yang baik dimulai dari tim yang terhubung.</h1>
        <p className="mt-5 max-w-[390px] text-sm leading-6 text-white/70">Kelola informasi pasien dan alur kerja klinik dalam satu ruang yang sederhana.</p>
        <div className="mt-9 space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3"><span className="flex size-7 items-center justify-center rounded-lg bg-white/15"><Icon name="users" size={15} /></span><span className="text-xs font-medium text-white/90">Data pasien lebih terorganisir</span><Icon name="check" size={15} className="ml-auto text-rose-200" /></div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3"><span className="flex size-7 items-center justify-center rounded-lg bg-white/15"><Icon name="workflow" size={15} /></span><span className="text-xs font-medium text-white/90">Alur perawatan lebih terarah</span><Icon name="check" size={15} className="ml-auto text-rose-200" /></div>
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-[11px] text-white/55"><span>© 2026 Rata Clinic Portal</span><span className="inline-flex items-center gap-1.5"><Icon name="lock" size={12} /> Akses khusus tim klinik</span></div>
    </section>
    <section className="flex min-h-screen flex-1 flex-col px-5 py-6 sm:px-10 lg:px-12">
      <header className="flex items-center justify-between lg:justify-end"><div className="lg:hidden"><AuthBrand /></div><Link to="/patients" className="text-xs font-semibold text-slate-500 transition-colors hover:text-rata-red">Kembali ke portal <span aria-hidden="true">→</span></Link></header>
      <div className="flex flex-1 items-center justify-center py-10"><div className="w-full max-w-[420px]">
        <div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[0.13em] text-rata-red">{mode === 'login' ? 'Portal Klinik Rata' : 'Bergabung dengan Rata'}</p><h2 className="text-[28px] font-bold tracking-[-0.045em] text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p></div>
        {children}
      </div></div>
      <footer className="text-center text-[11px] leading-5 text-slate-400">Dengan melanjutkan, Anda menyetujui <a href="#syarat" className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2">Syarat & Ketentuan</a> dan <a href="#privasi" className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2">Kebijakan Privasi</a>.</footer>
    </section>
  </main>
}

export function AuthNotice({ children }: { children: ReactNode }) {
  return <div role="status" className="mb-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-900"><Icon name="help" size={16} className="mt-0.5 shrink-0 text-amber-700" />{children}</div>
}
