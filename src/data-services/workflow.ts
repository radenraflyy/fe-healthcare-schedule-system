import type { WorkflowStep } from '../types/workflow'

export const defaultSteps: WorkflowStep[] = [
  { id: 1, title: 'Registrasi', description: 'Pendaftaran dan verifikasi data pasien' },
  { id: 2, title: 'Pemeriksaan', description: 'Pemeriksaan awal oleh dokter gigi' },
  { id: 3, title: 'Obat', description: 'Resep dan edukasi penggunaan obat' },
  { id: 4, title: 'Pembayaran', description: 'Penyelesaian administrasi dan pembayaran' },
]
