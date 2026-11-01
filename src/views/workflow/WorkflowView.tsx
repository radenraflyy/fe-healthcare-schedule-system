import { useState, type FormEvent } from 'react'
import { Icon } from '../../components/Icon'
import { PageHeading } from '../../components/PageHeading'
import { PrimaryButton } from '../../components/PrimaryButton'
import { defaultSteps } from '../../data-services/workflow'
import type { WorkflowStep } from '../../types/workflow'

export default function WorkflowView() {
  const [steps, setSteps] = useState<WorkflowStep[]>(() => {
    try {
      const saved = window.localStorage.getItem('rata-clinic-workflow')
      return saved ? JSON.parse(saved) as WorkflowStep[] : defaultSteps
    } catch { return defaultSteps }
  })
  const [newStep, setNewStep] = useState('')
  const [saved, setSaved] = useState(false)

  function addStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = newStep.trim()
    if (!title) return
    setSteps((current) => [...current, { id: Date.now(), title, description: 'Tambahkan keterangan untuk langkah ini' }])
    setNewStep('')
    setSaved(false)
  }

  function moveStep(index: number, direction: -1 | 1) {
    const destination = index + direction
    if (destination < 0 || destination >= steps.length) return
    setSteps((current) => {
      const next = [...current]
      ;[next[index], next[destination]] = [next[destination], next[index]]
      return next
    })
    setSaved(false)
  }

  function removeStep(id: number) {
    setSteps((current) => current.filter((step) => step.id !== id))
    setSaved(false)
  }

  function saveWorkflow() {
    window.localStorage.setItem('rata-clinic-workflow', JSON.stringify(steps))
    setSaved(true)
  }

  return <>
    <PageHeading eyebrow="Operasional klinik" title="Workflow Klinik" description="Susun alur kunjungan pasien agar setiap langkah perawatan berjalan konsisten." action={<PrimaryButton onClick={saveWorkflow}><Icon name="check" size={17} />Simpan workflow</PrimaryButton>} />
    {saved && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><Icon name="check" size={16} />Workflow berhasil disimpan di perangkat ini.</div>}
    <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="text-sm font-bold text-slate-800">Alur kunjungan pasien</h2><p className="mt-1 text-xs text-slate-400">Pratinjau urutan langkah yang akan dijalankan di klinik.</p></div>
      {steps.length > 0 ? <div className="overflow-x-auto px-5 py-7 sm:px-7"><div className="flex min-w-max items-center justify-center gap-3 sm:gap-5">{steps.map((step, index) => <div key={step.id} className="flex items-center gap-3 sm:gap-5"><div className="flex min-w-[130px] flex-col items-center text-center"><div className={`mb-3 flex size-11 items-center justify-center rounded-2xl text-sm font-bold ${index === 0 ? 'bg-rata-red text-white shadow-md shadow-rose-200' : 'bg-rose-50 text-rata-red'}`}>{index + 1}</div><p className="text-xs font-bold text-slate-800">{step.title}</p><p className="mt-1 max-w-[140px] text-[10px] leading-4 text-slate-400">{step.description}</p></div>{index < steps.length - 1 && <Icon name="arrow" size={17} className="-mt-8 text-slate-300" />}</div>)}</div></div> : <div className="px-6 py-12 text-center"><p className="text-sm font-semibold text-slate-700">Workflow masih kosong</p><p className="mt-1 text-xs text-slate-400">Tambahkan langkah pertama untuk menyusun alur klinik.</p></div>}
    </section>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800">Urutan langkah</h2><p className="mt-1 text-xs text-slate-400">Atur langkah dan urutannya.</p></div><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{steps.length} langkah</span></div>
        <div className="divide-y divide-slate-100">{steps.map((step, index) => <div key={step.id} className="flex items-center gap-3 px-4 py-4 sm:px-5"><div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-xs font-bold text-rata-red">{index + 1}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{step.title}</p><p className="mt-0.5 truncate text-xs text-slate-400">{step.description}</p></div><div className="flex items-center gap-1"><button type="button" aria-label={`Pindahkan ${step.title} ke atas`} disabled={index === 0} onClick={() => moveStep(index, -1)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"><Icon name="up" size={15} /></button><button type="button" aria-label={`Pindahkan ${step.title} ke bawah`} disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"><Icon name="down" size={15} /></button><button type="button" aria-label={`Hapus langkah ${step.title}`} onClick={() => removeStep(step.id)} className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rata-red"><Icon name="trash" size={15} /></button></div></div>)}
          {steps.length === 0 && <p className="px-5 py-8 text-center text-xs text-slate-400">Belum ada langkah workflow.</p>}
        </div>
        <form onSubmit={addStep} className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:p-5"><input value={newStep} onChange={(event) => setNewStep(event.target.value)} placeholder="Nama langkah baru..." aria-label="Nama langkah baru" className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none placeholder:text-slate-300 focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10" /><button type="submit" disabled={!newStep.trim()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rata-red active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"><Icon name="plus" size={16} />Tambah langkah</button></form>
      </section>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700"><Icon name="help" size={16} /></span><h2 className="text-sm font-bold text-slate-800">Tentang workflow</h2></div><p className="mt-3 text-sm leading-6 text-slate-500">Workflow membantu tim klinik mengikuti alur layanan yang sama untuk setiap kunjungan. Anda dapat menambah, menghapus, dan mengubah urutan langkah sesuai kebutuhan.</p><div className="mt-5 space-y-3"><div className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Icon name="check" size={12} /></span><p className="text-xs leading-5 text-slate-500">Gunakan judul langkah yang singkat dan mudah dipahami.</p></div><div className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Icon name="check" size={12} /></span><p className="text-xs leading-5 text-slate-500">Urutkan langkah dari pasien datang hingga administrasi selesai.</p></div><div className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Icon name="check" size={12} /></span><p className="text-xs leading-5 text-slate-500">Simpan perubahan agar alur tetap tersedia saat halaman dibuka kembali.</p></div></div></section>
    </div>
  </>
}
