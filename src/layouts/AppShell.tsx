import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { initialPatients } from '../data-services/patients'
import { BrandMark } from '../components/BrandMark'
import { Icon } from '../components/Icon'
import { MobileNav } from '../components/MobileNav'

export function AppShell() {
  const location = useLocation()
  const isPatients = location.pathname.startsWith('/patients')
  const isWorkflow = location.pathname.startsWith('/workflow')
  const pageLabel = isWorkflow ? 'Workflow klinik' : location.pathname.includes('/new') ? 'Tambah pasien' : location.pathname.includes('/edit') ? 'Edit pasien' : location.pathname.includes('/patients/PT') ? 'Detail pasien' : 'Daftar pasien'

  return (
    <div className="min-h-screen bg-[#f6f7f9] font-sans text-rata-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col border-r border-rata-border bg-white lg:flex">
        <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
          <BrandMark />
          <div><div className="text-[18px] font-bold tracking-[-0.04em]">rata<span className="text-rata-red">.</span></div><div className="-mt-0.5 text-[10px] font-medium tracking-[0.13em] text-slate-400">CLINIC PORTAL</div></div>
        </div>
        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Menu utama</p>
          <nav className="space-y-1">
            <NavLink to="/patients" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive || isPatients ? 'bg-rose-50 text-rata-red' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <Icon name="users" size={18} />Daftar pasien<span className="ml-auto rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">{initialPatients.length}</span>
            </NavLink>
            <NavLink to="/workflow" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive || isWorkflow ? 'bg-rose-50 text-rata-red' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <Icon name="workflow" size={18} />Workflow klinik
            </NavLink>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-[#fbf5f4] p-4">
            <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-white text-rata-red shadow-sm"><Icon name="help" size={17} /></div>
            <p className="text-sm font-semibold text-slate-800">Butuh bantuan?</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Tim Rata siap membantu operasional klinik Anda.</p>
            <button className="mt-3 text-xs font-bold text-rata-red hover:text-rata-red-dark">Hubungi support <span aria-hidden="true">→</span></button>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">MK</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">Maya Kusuma</p><p className="text-xs text-slate-400">Admin klinik</p></div>
            <button aria-label="Menu profil" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><Icon name="more" /></button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-10 flex h-[70px] items-center justify-between border-b border-rata-border bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden"><BrandMark /></div>
            <div><p className="text-xs text-slate-400">Klinik Rata <span className="px-1 text-slate-300">/</span> <span className="font-medium text-slate-600">{pageLabel}</span></p><p className="mt-0.5 text-sm font-semibold text-slate-800">Senayan, Jakarta Selatan</p></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 sm:flex"><Icon name="calendar" size={15} /> Minggu, 1 Nov 2026</div>
            <button aria-label="Notifikasi" className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100"><Icon name="bell" /><span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rata-red" /></button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="hidden items-center gap-2.5 sm:flex"><div className="flex size-8 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">MK</div><span className="text-sm font-semibold text-slate-700">Maya Kusuma</span></div>
          </div>
        </header>
        <div className="flex min-h-[calc(100vh-70px)] flex-col">
          <div className="border-b border-slate-200 bg-white px-4 py-2.5 lg:hidden">
            <nav className="flex gap-2"><MobileNav to="/patients" active={isPatients} label="Pasien" icon="users" /><MobileNav to="/workflow" active={isWorkflow} label="Workflow" icon="workflow" /></nav>
          </div>
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-7 sm:px-7 lg:px-10 lg:py-9"><Outlet /></main>
          <footer className="px-5 py-4 text-center text-[11px] text-slate-400">© 2026 Rata Clinic Portal <span className="px-1.5">·</span> Data tersimpan dengan aman</footer>
        </div>
      </div>
    </div>
  )
}
