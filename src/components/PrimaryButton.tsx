import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function PrimaryButton({ children, onClick, to, type = 'button', disabled = false }: { children: ReactNode; onClick?: () => void; to?: string; type?: 'button' | 'submit'; disabled?: boolean }) {
  const className = 'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rata-red px-4 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 ease-out hover:bg-rata-red-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
  return to ? <Link to={to} className={className}>{children}</Link> : <button type={type} disabled={disabled} onClick={onClick} className={className}>{children}</button>
}
