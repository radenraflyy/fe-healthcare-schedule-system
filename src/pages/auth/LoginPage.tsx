import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { AuthNotice, AuthShell } from '../../layouts/AuthShell'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [notice, setNotice] = useState('')
  const [forgot, setForgot] = useState(false)
  const inputClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('Form login sudah siap. Hubungkan endpoint autentikasi untuk mengaktifkan masuk ke akun.')
  }

  return <AuthShell mode="login">
    {notice && <AuthNotice>{notice}</AuthNotice>}
    {forgot && <AuthNotice>Fitur reset kata sandi memerlukan layanan email autentikasi.</AuthNotice>}
    <form onSubmit={handleSubmit} className="space-y-4.5">
      <label className="block"><span className="text-xs font-semibold text-slate-700">Email</span><div className="relative mt-1.5"><Icon name="mail" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input required type="email" autoComplete="email" placeholder="nama@klinik.com" className={`${inputClass} pl-10`} /></div></label>
      <label className="block"><span className="text-xs font-semibold text-slate-700">Kata sandi</span><div className="relative mt-1.5"><Icon name="lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input required minLength={8} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Masukkan kata sandi" className={`${inputClass} pl-10 pr-11`} /><button type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700"><Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} /></button></div></label>
      <div className="flex items-center justify-between pt-0.5"><label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="size-3.5 rounded border-slate-300 accent-rata-red" />Ingat saya</label><button type="button" onClick={() => { setForgot(true); setNotice('') }} className="text-xs font-semibold text-rata-red transition hover:text-rata-red-dark">Lupa kata sandi?</button></div>
      <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rata-red text-sm font-semibold text-white shadow-sm shadow-rose-200 transition-[background-color,transform] duration-150 ease-out hover:bg-rata-red-dark active:scale-[0.99]">Masuk ke akun<Icon name="arrow" size={16} /></button>
    </form>
    <p className="mt-7 text-center text-sm text-slate-500">Belum punya akun? <Link to="/auth/register" className="font-bold text-rata-red transition hover:text-rata-red-dark">Daftar sekarang</Link></p>
  </AuthShell>
}
