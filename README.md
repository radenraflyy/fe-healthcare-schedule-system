# Rata Healthcare Portal — Frontend

Frontend ini dibuat dengan React, TypeScript, dan Vite. Di sini ada fitur login/registrasi, data pasien, kalender, daftar dokter, booking janji temu, dan notifikasi. Semua request ke backend lewat GraphQL API Gateway. Frontend tidak memanggil Auth atau Schedule Service secara langsung.

## Menjalankan frontend

Yang perlu disiapkan: Node.js 22+ dan Yarn. Pastikan API Gateway dan service backend lainnya sudah jalan. Alamat GraphQL default-nya `http://localhost:3000/graphql`.

```sh
yarn install
cp .env.example .env.local
# Sesuaikan VITE_GRAPHQL_URL bila gateway GraphQL berada di URL lain.
yarn dev
```

Buka alamat Vite yang muncul di terminal (biasanya `http://localhost:5173`). Kalau alamat GraphQL-mu beda, atur `VITE_GRAPHQL_URL`. Tanpa variabel itu, frontend akan memakai `http://localhost:3000/graphql`. Vite membaca variabel `VITE_` saat server atau proses build dimulai.

## Menjalankan frontend lokal dengan Docker

Salin file environment contoh, lalu nyalakan Vite di Docker. Perubahan source tetap langsung dimuat ulang:

```sh
cp .env.example .env
docker compose up --build -d
```

Frontend bisa dibuka di `http://localhost:5173`. Source code diambil langsung dari folder lokal, jadi perubahan file langsung terlihat. Compose meneruskan `VITE_GRAPHQL_URL` dari `.env` ke Vite. Pastikan browser bisa menjangkau alamat GraphQL itu. Mau ganti port FE? Atur `FE_PORT` (default `5173`):

```sh
VITE_GRAPHQL_URL=http://localhost:3000/graphql docker compose up --build -d
```

Kalau dependencies berubah, build ulang image dengan `docker compose up --build -d`. Kalau sudah selesai, matikan container dengan `docker compose down`.

## Tes dan pemeriksaan

```sh
yarn test
yarn lint
yarn build
```

Form memakai TanStack Form dan validasinya menggunakan Yup. Schema dan resolver tiap fitur ada di file `config.ts` dekat view-nya: `src/views/auth/login`, `src/views/auth/register`, `src/views/patients`, `src/views/appointments/booking`, `src/views/appointments/reschedule`, `src/views/doctors/management`, dan `src/views/workflow`. Yup 1.7+ terhubung lewat dukungan Standard Schema dari TanStack Form. Jadi, data dicek dulu sebelum request GraphQL dikirim.

Tesnya memakai `node:test` bawaan Node. Belum ada framework khusus untuk tes komponen. Cakupannya termasuk pesan error autentikasi, validasi form, waktu booking UTC, aturan role, status baca notifikasi, serta urutan dan data workflow yang disimpan.