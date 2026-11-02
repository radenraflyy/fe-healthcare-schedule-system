import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

import { DataTable } from '../../components/DataTable';
import { PageHeading } from '../../components/PageHeading';
import { type Doctor, api } from '../../data-services/api';
import { useAuth } from '../../data-services/auth-context';

const column = createColumnHelper<Doctor>();

export default function DoctorsView() {
  const { user } = useAuth();
  const doctors = useQuery({
    queryKey: ['doctors', 'table'],
    queryFn: () => api.allDoctors(),
    staleTime: 60_000,
  });
  const columns = useMemo(
    () => [
      column.accessor('name', {
        header: 'Nama dokter',
        cell: (info) => <span className='font-semibold text-slate-800'>{info.getValue()}</span>,
      }),
      column.display({
        id: 'role',
        header: 'Peran',
        cell: () => 'Dokter',
      }),
      ...(user?.role === 'CUSTOMER'
        ? [
            column.display({
              id: 'action',
              header: 'Aksi',
              cell: () => (
                <Link
                  to='/appointments/new'
                  className='font-semibold text-rata-red hover:underline'
                >
                  Buat janji temu →
                </Link>
              ),
            }),
          ]
        : []),
    ],
    [user?.role],
  );

  return (
    <>
      <PageHeading
        eyebrow='Tim medis'
        title='Dokter kami'
        description='Pilih dokter untuk melihat waktu konsultasi yang tersedia.'
      />
      {doctors.isLoading ? (
        <p role='status' className='rounded-2xl bg-white p-8 text-center text-sm text-slate-500'>
          Memuat daftar dokter…
        </p>
      ) : doctors.error ? (
        <p role='alert' className='rounded-2xl bg-white p-8 text-center text-sm text-rose-700'>
          {doctors.error.message}
        </p>
      ) : (
        <DataTable
          data={doctors.data ?? []}
          columns={columns}
          searchPlaceholder='Cari nama dokter…'
          emptyMessage='Belum ada dokter yang terdaftar.'
        />
      )}
    </>
  );
}
