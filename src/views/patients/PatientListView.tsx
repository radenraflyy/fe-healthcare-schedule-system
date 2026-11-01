import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { Icon } from '../../components/Icon'
import { PageHeading } from '../../components/PageHeading'
import { PrimaryButton } from '../../components/PrimaryButton'
import { StatusBadge } from '../../components/StatusBadge'
import type { Patient } from '../../types/patient'

export default function PatientListView({ patients }: { patients: Patient[] }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'Semua' | Patient['status']>('Semua')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredPatients = useMemo(() => patients.filter((patient) => {
    const matchesSearch = [patient.name, patient.id, patient.phone, patient.email, patient.treatment].some((value) => value.toLowerCase().includes(normalizedQuery))
    return matchesSearch && (filter === 'Semua' || patient.status === filter)
  }), [filter, normalizedQuery, patients])
  const activeCount = patients.filter((patient) => patient.status === 'Aktif').length
  const waitingCount = patients.filter((patient) => patient.status === 'Menunggu').length
  const completedCount = patients.filter((patient) => patient.status === 'Selesai').length

  const stats = [
    { label: 'Total pasien', value: patients.length.toString(), note: 'Seluruh data pasien', icon: 'users', tint: 'bg-rose-50 text-rata-red' },
    { label: 'Perawatan aktif', value: activeCount.toString(), note: 'Sedang dalam perawatan', icon: 'workflow', tint: 'bg-emerald-50 text-emerald-700' },
    { label: 'Menunggu jadwal', value: waitingCount.toString(), note: 'Perlu konfirmasi', icon: 'clock', tint: 'bg-amber-50 text-amber-700' },
    { label: 'Perawatan selesai', value: completedCount.toString(), note: 'Pasien menyelesaikan perawatan', icon: 'check', tint: 'bg-sky-50 text-sky-700' },
  ]

  return <>
    <PageHeading eyebrow="Manajemen klinik" title="Daftar Pasien" description="Kelola informasi pasien dan pantau perjalanan perawatannya." action={<PrimaryButton to="/patients/new"><Icon name="plus" size={17} />Tambah pasien</PrimaryButton>} />
    <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-slate-500">{stat.label}</p><p className="mt-2 text-[26px] font-bold tracking-[-0.04em] text-slate-900">{stat.value}</p></div><div className={`flex size-9 items-center justify-center rounded-xl ${stat.tint}`}><Icon name={stat.icon} size={17} /></div></div><p className="mt-1 text-[11px] text-slate-400">{stat.note}</p></div>)}
    </div>
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div><h2 className="text-sm font-bold text-slate-800">Semua pasien <span className="ml-1.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">{filteredPatients.length}</span></h2><p className="mt-1 text-xs text-slate-400">Informasi pasien dan status perawatan</p></div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block"><span className="sr-only">Cari pasien</span><Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, ID, nomor HP..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10 sm:w-[240px]" /></label>
          <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} aria-label="Filter status pasien" className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10 sm:w-auto"><option>Semua</option><option>Aktif</option><option>Menunggu</option><option>Selesai</option></select>
        </div>
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[800px] text-left">
          <thead><tr className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400"><th className="px-5 py-3.5">Pasien</th><th className="px-4 py-3.5">Kontak</th><th className="px-4 py-3.5">Perawatan</th><th className="px-4 py-3.5">Kunjungan berikutnya</th><th className="px-4 py-3.5">Status</th><th className="w-9 px-3 py-3.5" /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map((patient) => <tr key={patient.id} className="group cursor-pointer transition-colors hover:bg-rose-50/30" onClick={() => navigate(`/patients/${patient.id}`)}>
              <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={patient.name} /><div><p className="text-sm font-semibold text-slate-800 group-hover:text-rata-red">{patient.name}</p><p className="mt-0.5 text-[11px] text-slate-400">{patient.id}</p></div></div></td>
              <td className="px-4 py-4"><p className="text-xs font-medium text-slate-700">{patient.phone}</p><p className="mt-1 text-[11px] text-slate-400">{patient.email}</p></td>
              <td className="px-4 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-600">{patient.treatment}</span></td>
              <td className="px-4 py-4"><div className="flex items-center gap-2 text-xs text-slate-600"><Icon name="calendar" size={14} className="text-slate-400" />{patient.nextVisit}</div></td>
              <td className="px-4 py-4"><StatusBadge status={patient.status} /></td>
              <td className="px-3 py-4"><Icon name="chevron" size={17} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rata-red" /></td>
            </tr>)}
            {filteredPatients.length === 0 && <tr><td colSpan={6} className="px-5 py-16 text-center"><div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Icon name="search" size={20} /></div><p className="text-sm font-semibold text-slate-700">Pasien tidak ditemukan</p><p className="mt-1 text-xs text-slate-400">Coba kata kunci lain atau ubah filter status.</p></td></tr>}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-100 md:hidden">
        {filteredPatients.map((patient) => <button key={patient.id} type="button" onClick={() => navigate(`/patients/${patient.id}`)} className="block w-full px-4 py-4 text-left transition-colors hover:bg-rose-50/30">
          <span className="flex items-center gap-3"><Avatar name={patient.name} size="sm" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{patient.name}</span><span className="mt-0.5 block text-[11px] text-slate-400">{patient.id}</span></span><StatusBadge status={patient.status} /><Icon name="chevron" size={16} className="shrink-0 text-slate-300" /></span>
          <span className="mt-4 grid grid-cols-2 gap-3 pl-12"><span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Perawatan</span><span className="mt-1 block truncate text-xs font-medium text-slate-700">{patient.treatment}</span></span><span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Jadwal berikutnya</span><span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-700"><Icon name="calendar" size={13} className="shrink-0 text-slate-400" />{patient.nextVisit}</span></span></span>
          <span className="mt-3 block truncate pl-12 text-[11px] text-slate-400">{patient.phone}<span className="px-1.5">·</span>{patient.email}</span>
        </button>)}
        {filteredPatients.length === 0 && <div className="px-5 py-12 text-center"><p className="text-sm font-semibold text-slate-700">Pasien tidak ditemukan</p><p className="mt-1 text-xs text-slate-400">Coba kata kunci lain atau ubah filter status.</p></div>}
      </div>
      <div className="flex flex-col gap-1.5 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-5"><span>Menampilkan <span className="font-semibold text-slate-600">{filteredPatients.length}</span> dari {patients.length} pasien</span><span>Data diperbarui hari ini</span></div>
    </section>
  </>
}
