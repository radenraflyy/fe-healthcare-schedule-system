export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors = ['bg-rose-100 text-rose-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-800', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700']
  const color = colors[name.charCodeAt(0) % colors.length]
  const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const sizeClass = size === 'lg' ? 'size-16 text-lg' : size === 'sm' ? 'size-9 text-xs' : 'size-11 text-sm'
  return <div className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${color} ${sizeClass}`}>{initials}</div>
}
