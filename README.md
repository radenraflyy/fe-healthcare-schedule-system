# Rata Healthcare Portal (Frontend)

Frontend React + TypeScript + Vite untuk autentikasi, daftar pasien, kalender mingguan, daftar dokter, booking dan pengelolaan janji temu, serta notifikasi. Semua komunikasi aplikasi dengan backend menggunakan GraphQL melalui gateway; frontend tidak menghubungi Auth atau Schedule service secara langsung.

## Menjalankan frontend

Prasyarat: Node.js 22 atau lebih baru dan Yarn. Jalankan backend gateway beserta service pendukungnya pada port yang dikonfigurasi backend (GraphQL default `http://localhost:3000/graphql`).

```sh
yarn install
cp .env.example .env.local
# Sesuaikan VITE_GRAPHQL_URL bila gateway GraphQL berada di URL lain.
yarn dev
```

Buka URL Vite yang ditampilkan (umumnya `http://localhost:5173`). Atur endpoint dengan `VITE_GRAPHQL_URL`; bila variabel tidak diisi, frontend menggunakan `http://localhost:3000/graphql`. Vite membaca variabel `VITE_` saat server/build dimulai.

## Menjalankan frontend lokal dengan Docker

Salin contoh environment, lalu jalankan Vite dalam container dengan hot reload:

```sh
cp .env.example .env
docker compose up --build -d
```

Frontend tersedia di `http://localhost:5173`. Source code di-mount dari folder lokal, sehingga perubahan file langsung dimuat ulang. Compose meneruskan `VITE_GRAPHQL_URL` dari `.env` ke Vite; URL GraphQL harus dapat dijangkau browser. Untuk mengganti port FE, atur `FE_PORT` (default `5173`):

```sh
VITE_GRAPHQL_URL=http://localhost:3000/graphql docker compose up --build -d
```

Jika dependencies berubah, rebuild image dengan `docker compose up --build -d`. Untuk menghentikan container, jalankan `docker compose down`.

## Tes dan pemeriksaan

```sh
yarn test
yarn lint
yarn build
```

Form dikelola dengan TanStack Form dan divalidasi menggunakan Yup. Setiap schema dan resolver berada di `config.ts` dekat module-nya: `src/views/auth/login`, `src/views/auth/register`, `src/views/patients`, `src/views/appointments/booking`, `src/views/appointments/reschedule`, `src/views/doctors/management`, dan `src/views/workflow`. Yup 1.7+ terintegrasi lewat dukungan Standard Schema TanStack Form, sehingga validasi dijalankan sebelum operasi GraphQL.

Tes memakai `node:test` bawaan Node karena repository belum membawa framework test komponen. Tes mencakup pemetaan error autentikasi, schema validasi, waktu booking UTC, kebijakan role, status baca notifikasi, serta urutan dan payload simpan workflow.

## Checklist uji manual

1. Buka halaman register, coba email tidak valid, kata sandi kurang dari 8 karakter, konfirmasi berbeda, lalu registrasi valid. Pesan sukses mengarahkan pengguna untuk masuk; kata sandi tidak disimpan di sesi.
2. Masuk dengan akun customer. Muat ulang aplikasi untuk memastikan `validateToken(token)` memeriksa kembali sesi; uji token yang kedaluwarsa dengan menghapus/menukar token di penyimpanan browser dan pastikan diarahkan ke login.
3. Pada **Dokter**, pastikan daftar memakai data backend. Di **Buat janji temu**, pilih dokter dan tanggal; uji tanggal tanpa slot, pilih slot yang tersedia, isi tujuan, dan kirim. Waktu dikirim sebagai ISO UTC, sedangkan UI menampilkan zona waktu perangkat.
4. Dari **Jadwal saya**, buka detail, jadwalkan ulang permintaan `REQUESTED`, dan uji pembatalan pada jadwal lebih dari 24 jam serta kurang dari 24 jam. Login sebagai dokter untuk menguji konfirmasi dan penyelesaian sesuai waktu jadwal.
5. Pada **Notifikasi**, pastikan judul/pesan/waktu/status muncul; tandai satu notifikasi telah dibaca dan tunggu polling hingga 60 detik untuk pembaruan backend.
6. Putuskan gateway atau matikan salah satu backend service sementara untuk memastikan pesan layanan tidak tersedia tetap aman dan dapat dipahami.

Reminder in-app dibuat backend 24 jam dan 1 jam sebelum janji. Frontend memeriksa notifikasi dengan polling GraphQL satu menit sekali; email konfirmasi adalah email backend, bukan notifikasi in-app.

## Pasien, kalender, dan akses

- **Daftar Pasien** memakai query GraphQL `customers(page, limit)` dengan pagination 10 item. Pencarian nama/email/ID menunggu 300 ms sebelum berjalan; karena schema backend belum memiliki argumen pencarian, pencarian meminta halaman customer backend lalu memfilter hasilnya.
- Detail pasien memakai `customer(id)` serta daftar janji `schedules(customerId, ...)`. Admin dapat membuat, mengedit, dan menghapus profil melalui `createCustomer`, `updateCustomer`, dan `deleteCustomer`. Profil menyimpan nama, email, telepon, gender, tanggal lahir, alamat, jenis/status perawatan, kunjungan berikutnya, dan catatan.
- Menu admin **Kelola dokter** menggunakan operasi GraphQL buat/edit/hapus dokter, baca/tambah/hapus jam praktik mingguan (`doctorAvailabilities`, `setDoctorAvailability`, `deleteDoctorAvailability`), mengubah role akun (`setUserRole`), dan memeriksa `scheduleHealth`. Dokter dengan jadwal terkait tidak dapat dihapus; jam praktik ditafsirkan backend sebagai UTC.
- Admin dapat menghapus jadwal dari daftar janji. Aksi role lain tetap mengikuti izin yang diberikan backend.
- **Kalender** menampilkan tampilan mingguan dari `schedules(from, to, page, limit)`, dengan tombol minggu sebelumnya/berikutnya dan tautan ke detail janji.
- Pengelolaan daftar, detail, create, dan edit pasien hanya ditampilkan untuk role `ADMIN`. Role `DOCTOR` dan `CUSTOMER` tidak memperoleh aksi edit pasien; backend tetap memvalidasi izin setiap operasi.
- **Workflow Klinik** memuat dan menyimpan langkah melalui `workflowSteps` dan `saveWorkflowSteps`. Data tersimpan di Schedule PostgreSQL per akun admin; service membatasi hingga 50 langkah, lalu urutan mengikuti posisi di daftar.

Untuk uji manual, masuk sebagai admin untuk memeriksa pagination, pencarian debounced, seluruh field pasien, kalender, workflow, tambah/edit/hapus dokter, jam praktik, pengubahan role, dan penghapusan jadwal. Tambahkan beberapa langkah workflow, ubah urutannya dengan tombol atas/bawah, hapus satu, simpan, lalu muat ulang untuk memastikan hasilnya tetap ada. Lalu masuk sebagai dokter/customer dan pastikan menu admin tidak tersedia.
