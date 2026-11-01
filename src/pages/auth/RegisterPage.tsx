import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { AuthNotice, AuthShell } from '../../layouts/AuthShell'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi belum sama.')
      setNotice('')
      return
    }
    if (!accepted) {
      setError('Setujui Syarat & Ketentuan dan Kebijakan Privasi untuk melanjutkan.')
      setNotice('')
      return
    }
    setError('')
    setNotice('Form registrasi valid. Hubungkan endpoint autentikasi untuk membuat akun.')
  }

  return <AuthShell mode="register">
    {notice && <AuthNotice>{notice}</AuthNotice>}
    {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-700">{error}</div>}
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <label className="block"><span className="text-xs font-semibold text-slate-700">Nama lengkap</span><input required autoComplete="name" placeholder="Nama Anda" className={inputClass} /></label>
      <label className="block"><span className="text-xs font-semibold text-slate-700">Nama klinik</span><input required placeholder="Contoh: Klinik Gigi Senayan" className={inputClass} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="text-xs font-semibold text-slate-700">Email</span><input required type="email" autoComplete="email" placeholder="nama@klinik.com" className={inputClass} /></label>
        <label className="block"><span className="text-xs font-semibold text-slate-700">Nomor telepon</span><input required type="tel" autoComplete="tel" placeholder="08xx xxxx xxxx" className={inputClass} /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="text-xs font-semibold text-slate-700">Kata sandi</span><div className="relative"><input required minLength={8} name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Min. 8 karakter" className={`${inputClass} pr-10`} /><button type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-[23px] rounded-md p-1 text-slate-400 transition hover:text-slate-700"><Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} /></button></div></label>
        <label className="block"><span className="text-xs font-semibold text-slate-700">Konfirmasi kata sandi</span><input required minLength={8} name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Ulangi kata sandi" className={inputClass} /></label>
      </div>
      <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-5 text-slate-500"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 size-3.5 shrink-0 rounded border-slate-300 accent-rata-red" /><span>Saya menyetujui <a href="#syarat" className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2">Syarat & Ketentuan</a> dan <a href="#privasi" className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2">Kebijakan Privasi</a>.</span></label>
      <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rata-red text-sm font-semibold text-white shadow-sm shadow-rose-200 transition-[background-color,transform] duration-150 ease-out hover:bg-rata-red-dark active:scale-[0.99]">Buat akun<Icon name="arrow" size={16} /></button>
    </form>
    <p className="mt-5 text-center text-sm text-slate-500">Sudah punya akun? <Link to="/auth/login" className="font-bold text-rata-red transition hover:text-rata-red-dark">Masuk</Link></p>
  </AuthShell>
}
