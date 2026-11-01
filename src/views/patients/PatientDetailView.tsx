import { Link, Navigate, useParams } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { Icon } from '../../components/Icon'
import { InfoItem, SummaryItem } from '../../components/PatientDetails'
import { PageHeading } from '../../components/PageHeading'
import { PrimaryButton } from '../../components/PrimaryButton'
import { StatusBadge } from '../../components/StatusBadge'
import type { Patient } from '../../types/patient'

export default function PatientDetailView({ patients }: { patients: Patient[] }) {
  const { id } = useParams()
  const patient = patients.find((item) => item.id === id)
  if (!patient) return <Navigate to="/patients" replace />

  return <>
    <Link to="/patients" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-rata-red"><Icon name="back" size={15} />Kembali ke daftar pasien</Link>
    <PageHeading eyebrow="Profil pasien" title={patient.name} description={`ID pasien ${patient.id} · Terdaftar sejak ${patient.since}`} action={<div className="flex gap-2"><PrimaryButton to={`/patients/${patient.id}/edit`}><Icon name="edit" size={16} />Edit pasien</PrimaryButton></div>} />
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(290px,0.8fr)]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center"><Avatar name={patient.name} size="lg" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2.5"><h2 className="text-lg font-bold tracking-[-0.03em] text-slate-900">{patient.name}</h2><StatusBadge status={patient.status} /></div><p className="mt-1 text-xs text-slate-400">Pasien sejak {patient.since}</p></div><span className="self-start rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rata-red sm:self-auto">{patient.treatment}</span></div>
          <div className="my-5 h-px bg-slate-100" />
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <InfoItem icon="phone" label="Nomor telepon" value={patient.phone} />
            <InfoItem icon="mail" label="Email" value={patient.email || 'Belum diisi'} />
            <InfoItem icon="calendar" label="Tanggal lahir" value={patient.birthDate ? new Date(`${patient.birthDate}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum diisi'} />
            <InfoItem icon="users" label="Jenis kelamin" value={patient.gender || 'Belum diisi'} />
            <InfoItem icon="pin" label="Alamat" value={patient.address || 'Belum diisi'} className="sm:col-span-2" />
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-sm font-bold text-slate-800">Riwayat kunjungan</h2><p className="mt-1 text-xs text-slate-400">Catatan kunjungan dan jadwal pasien</p></div><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{patient.visits.length} kunjungan</span></div>
          {patient.visits.length > 0 ? <div className="divide-y divide-slate-100">{patient.visits.map((visit, index) => <div key={`${visit.date}-${visit.type}`} className="flex gap-3 px-5 py-4 sm:gap-4 sm:px-6"><div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${visit.status === 'Terjadwal' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}><Icon name={visit.status === 'Terjadwal' ? 'calendar' : 'check'} size={16} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className="text-sm font-semibold text-slate-800">{visit.type}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${visit.status === 'Terjadwal' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{visit.status}</span></div><p className="mt-1 text-xs text-slate-500">{visit.note}</p><p className="mt-2 text-[11px] text-slate-400">{visit.date} · {visit.time} · {visit.doctor}</p></div>{index === 0 && <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-300 sm:block">Terbaru</span>}</div>)}</div> : <div className="px-6 py-12 text-center text-sm text-slate-400">Belum ada riwayat kunjungan.</div>}
        </section>
      </div>
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-rose-50 text-rata-red"><Icon name="workflow" size={16} /></span><h2 className="text-sm font-bold text-slate-800">Ringkasan perawatan</h2></div><div className="mt-5 space-y-4"><SummaryItem label="Jenis perawatan" value={patient.treatment} /><SummaryItem label="Status pasien" value={<StatusBadge status={patient.status} />} /><SummaryItem label="Kunjungan berikutnya" value={patient.nextVisit} /><SummaryItem label="Jumlah kunjungan" value={`${patient.visits.length} kali`} /></div></section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Icon name="note" size={16} /></span><h2 className="text-sm font-bold text-slate-800">Catatan klinik</h2></div><p className="mt-3 text-sm leading-6 text-slate-600">{patient.note || 'Belum ada catatan klinik untuk pasien ini.'}</p></section>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4"><p className="text-xs font-semibold text-rose-900">Privasi pasien</p><p className="mt-1 text-xs leading-5 text-rose-800/70">Informasi medis ini hanya untuk keperluan perawatan klinik.</p></div>
      </div>
    </div>
  </>
}
