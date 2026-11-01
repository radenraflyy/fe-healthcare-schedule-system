import type { Patient } from '../types/patient'

export const initialPatients: Patient[] = [
  {
    id: 'PT-2025-0142', name: 'Nadia Putri', gender: 'Perempuan', birthDate: '1998-04-18',
    phone: '0812 3456 7890', email: 'nadia.putri@email.com', address: 'Kebayoran Baru, Jakarta Selatan',
    treatment: 'Clear aligner', status: 'Aktif', since: '12 Mar 2025', nextVisit: '06 Nov 2026',
    note: 'Kontrol rutin setiap 4 minggu. Pasien menggunakan aligner set ke-8.',
    visits: [
      { date: '23 Okt 2026', time: '10.30', type: 'Kontrol aligner', doctor: 'drg. Maya Kusuma', note: 'Pergerakan gigi sesuai rencana. Lanjut set ke-8.', status: 'Selesai' },
      { date: '25 Sep 2026', time: '09.00', type: 'Kontrol aligner', doctor: 'drg. Maya Kusuma', note: 'Pemeriksaan kondisi gusi dan kecocokan aligner.', status: 'Selesai' },
      { date: '06 Nov 2026', time: '11.00', type: 'Kontrol rutin', doctor: 'drg. Maya Kusuma', note: 'Kontrol progres perawatan.', status: 'Terjadwal' },
    ],
  },
  {
    id: 'PT-2025-0138', name: 'Rizky Ramadhan', gender: 'Laki-laki', birthDate: '1995-11-02',
    phone: '0813 8800 1122', email: 'rizky.r@email.com', address: 'Cilandak, Jakarta Selatan',
    treatment: 'Pembersihan karang gigi', status: 'Menunggu', since: '03 Feb 2025', nextVisit: '04 Nov 2026',
    note: 'Menunggu konfirmasi jadwal dari pasien.', visits: [
      { date: '03 Feb 2025', time: '14.00', type: 'Konsultasi awal', doctor: 'drg. Tania Putri', note: 'Pemeriksaan kondisi gigi dan gusi.', status: 'Selesai' },
      { date: '04 Nov 2026', time: '14.30', type: 'Scaling', doctor: 'drg. Tania Putri', note: 'Pembersihan karang gigi.', status: 'Terjadwal' },
    ],
  },
  {
    id: 'PT-2025-0126', name: 'Clara Wijaya', gender: 'Perempuan', birthDate: '2000-07-29',
    phone: '0821 5566 7700', email: 'clara.w@email.com', address: 'Menteng, Jakarta Pusat',
    treatment: 'Konsultasi ortodonti', status: 'Aktif', since: '18 Jan 2025', nextVisit: '08 Nov 2026',
    note: 'Evaluasi lanjutan setelah konsultasi ortodonti.', visits: [
      { date: '18 Jan 2025', time: '11.00', type: 'Konsultasi ortodonti', doctor: 'drg. Aditya Pranoto', note: 'Diskusi pilihan perawatan dan estimasi.', status: 'Selesai' },
      { date: '08 Nov 2026', time: '13.00', type: 'Evaluasi', doctor: 'drg. Aditya Pranoto', note: 'Evaluasi kondisi gigi.', status: 'Terjadwal' },
    ],
  },
  {
    id: 'PT-2024-0104', name: 'Dimas Saputra', gender: 'Laki-laki', birthDate: '1992-02-14',
    phone: '0857 9911 3355', email: 'dimas.saputra@email.com', address: 'Pancoran, Jakarta Selatan',
    treatment: 'Pemeriksaan umum', status: 'Selesai', since: '21 Des 2024', nextVisit: '—',
    note: 'Perawatan selesai. Sarankan pemeriksaan rutin 6 bulan lagi.', visits: [
      { date: '21 Des 2024', time: '16.00', type: 'Pemeriksaan umum', doctor: 'drg. Rani Puspita', note: 'Pemeriksaan dan edukasi kebersihan gigi.', status: 'Selesai' },
      { date: '05 Jan 2025', time: '10.00', type: 'Tambal gigi', doctor: 'drg. Rani Puspita', note: 'Perawatan selesai dengan baik.', status: 'Selesai' },
    ],
  },
  {
    id: 'PT-2024-0097', name: 'Maya Anggraini', gender: 'Perempuan', birthDate: '1989-09-10',
    phone: '0819 4422 6688', email: 'maya.anggraini@email.com', address: 'Pondok Indah, Jakarta Selatan',
    treatment: 'Perawatan gusi', status: 'Aktif', since: '14 Nov 2024', nextVisit: '10 Nov 2026',
    note: 'Pantau sensitivitas gigi dan kondisi gusi saat kontrol.', visits: [
      { date: '14 Nov 2024', time: '09.30', type: 'Pemeriksaan gusi', doctor: 'drg. Maya Kusuma', note: 'Pemeriksaan awal dan rencana perawatan.', status: 'Selesai' },
      { date: '10 Nov 2026', time: '09.30', type: 'Kontrol gusi', doctor: 'drg. Maya Kusuma', note: 'Evaluasi kondisi gusi.', status: 'Terjadwal' },
    ],
  },
]
