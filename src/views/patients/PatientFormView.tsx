import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PageHeading } from '../../components/PageHeading'
import { PrimaryButton } from '../../components/PrimaryButton'
import type { Patient } from '../../types/patient'

export default function PatientFormView({ patients, onSave }: { patients: Patient[]; onSave: (patient: Patient) => void }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const existingPatient = patients.find((item) => item.id === id)
  const [name, setName] = useState(existingPatient?.name ?? '')
  const [gender, setGender] = useState(existingPatient?.gender ?? '')
  const [birthDate, setBirthDate] = useState(existingPatient?.birthDate ?? '')
  const [phone, setPhone] = useState(existingPatient?.phone ?? '')
  const [email, setEmail] = useState(existingPatient?.email ?? '')
  const [address, setAddress] = useState(existingPatient?.address ?? '')
  const [treatment, setTreatment] = useState(existingPatient?.treatment ?? '')
  const [status, setStatus] = useState<Patient['status']>(existingPatient?.status ?? 'Aktif')
  const [nextVisit, setNextVisit] = useState(existingPatient?.nextVisit ?? '')
  const [note, setNote] = useState(existingPatient?.note ?? '')
  const [error, setError] = useState('')
  const isEditing = Boolean(existingPatient)

  if (id && !existingPatient) return <Navigate to="/patients" replace />

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Nama pasien dan nomor telepon wajib diisi.')
      return
    }
    const patientId = existingPatient?.id ?? `PT-2026-${String(Date.now()).slice(-4)}`
    const patient: Patient = {
      id: patientId, name: name.trim(), gender, birthDate, phone: phone.trim(), email: email.trim(), address: address.trim(),
      treatment: treatment || 'Pemeriksaan umum', status, since: existingPatient?.since ?? new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      nextVisit: nextVisit ? new Date(`${nextVisit}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
      note: note.trim(), visits: existingPatient?.visits ?? [],
    }
    onSave(patient)
    navigate(`/patients/${patientId}`)
  }

  const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10'
  const labelClass = 'text-xs font-semibold text-slate-600'

  return <>
    <Link to={existingPatient ? `/patients/${existingPatient.id}` : '/patients'} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-rata-red"><Icon name="back" size={15} />Kembali</Link>
    <PageHeading eyebrow="Data pasien" title={isEditing ? 'Edit Pasien' : 'Tambah Pasien'} description={isEditing ? 'Perbarui informasi dan detail perawatan pasien.' : 'Lengkapi informasi pasien untuk membuat profil baru.'} />
    <form onSubmit={handleSubmit} className="max-w-[900px]">
      {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <section className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
        <div className="mb-5"><h2 className="text-sm font-bold text-slate-800">Informasi pribadi</h2><p className="mt-1 text-xs text-slate-400">Masukkan data dasar untuk identifikasi pasien.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className={labelClass}>Nama lengkap <span className="text-rata-red">*</span></span><input required value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="Contoh: Nadia Putri" className={inputClass} /></label>
          <label><span className={labelClass}>Jenis kelamin</span><select value={gender} onChange={(event) => setGender(event.target.value)} className={inputClass}><option value="">Pilih jenis kelamin</option><option>Perempuan</option><option>Laki-laki</option></select></label>
          <label><span className={labelClass}>Tanggal lahir</span><input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className={inputClass} /></label>
          <label><span className={labelClass}>Nomor telepon <span className="text-rata-red">*</span></span><input required value={phone} onChange={(event) => { setPhone(event.target.value); setError('') }} placeholder="08xx xxxx xxxx" className={inputClass} /></label>
          <label><span className={labelClass}>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className={inputClass} /></label>
          <label className="sm:col-span-2"><span className={labelClass}>Alamat</span><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Kecamatan, kota" className={inputClass} /></label>
        </div>
      </section>
      <section className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
        <div className="mb-5"><h2 className="text-sm font-bold text-slate-800">Informasi perawatan</h2><p className="mt-1 text-xs text-slate-400">Atur perawatan dan status pasien saat ini.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={labelClass}>Jenis perawatan</span><select value={treatment} onChange={(event) => setTreatment(event.target.value)} className={inputClass}><option value="">Pilih jenis perawatan</option><option>Clear aligner</option><option>Konsultasi ortodonti</option><option>Pemeriksaan umum</option><option>Pembersihan karang gigi</option><option>Perawatan gusi</option><option>Tambal gigi</option><option>Lainnya</option></select></label>
          <label><span className={labelClass}>Status pasien</span><select value={status} onChange={(event) => setStatus(event.target.value as Patient['status'])} className={inputClass}><option>Aktif</option><option>Menunggu</option><option>Selesai</option></select></label>
          <label><span className={labelClass}>Jadwal kunjungan berikutnya</span><input type="date" value={nextVisit} onChange={(event) => setNextVisit(event.target.value)} className={inputClass} /></label>
          <label className="sm:col-span-2"><span className={labelClass}>Catatan klinik</span><textarea rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tambahkan catatan yang relevan untuk perawatan pasien..." className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10" /></label>
        </div>
      </section>
      <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row"><Link to={existingPatient ? `/patients/${existingPatient.id}` : '/patients'} className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Batal</Link><PrimaryButton type="submit"><Icon name="check" size={17} />{isEditing ? 'Simpan perubahan' : 'Simpan pasien'}</PrimaryButton></div>
    </form>
  </>
}
