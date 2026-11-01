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