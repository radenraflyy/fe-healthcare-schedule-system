import { Link } from 'react-router-dom'
import { Icon } from './Icon'

export function MobileNav({ to, active, label, icon }: { to: string; active: boolean; label: string; icon: string }) {
  return <Link to={to} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${active ? 'bg-rose-50 text-rata-red' : 'text-slate-500 hover:bg-slate-50'}`}><Icon name={icon} size={15} />{label}</Link>
}
