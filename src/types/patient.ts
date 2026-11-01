export type Visit = {
  date: string
  time: string
  type: string
  doctor: string
  note: string
  status: 'Selesai' | 'Terjadwal'
}

export type Patient = {
  id: string
  name: string
  gender: string
  birthDate: string
  phone: string
  email: string
  address: string
  treatment: string
  status: 'Aktif' | 'Selesai' | 'Menunggu'
  since: string
  nextVisit: string
  note: string
  visits: Visit[]
}
