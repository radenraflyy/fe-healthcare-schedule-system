import type { Patient } from '../types/patient'

export function StatusBadge({ status }: { status: Patient['status'] }) {
  const styles = status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' : status === 'Menunggu' ? 'bg-amber-50 text-amber-700 ring-amber-600/15' : 'bg-slate-100 text-slate-600 ring-slate-500/10'
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>
}
