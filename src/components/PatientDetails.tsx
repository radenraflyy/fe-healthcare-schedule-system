import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function InfoItem({ icon, label, value, className = '' }: { icon: string; label: string; value: string; className?: string }) {
  return <div className={className}><div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400"><Icon name={icon} size={13} />{label}</div><p className="text-sm font-medium leading-5 text-slate-700">{value}</p></div>
}

export function SummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><span className="text-xs text-slate-500">{label}</span><span className="text-right text-xs font-semibold text-slate-700">{value}</span></div>
}
