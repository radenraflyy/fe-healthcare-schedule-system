import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '../../components/Avatar';
import { DataTable } from '../../components/DataTable';
import { Icon } from '../../components/Icon';
import { PageHeading } from '../../components/PageHeading';
import { PrimaryButton } from '../../components/PrimaryButton';
import { type CustomerProfile, api } from '../../data-services/api';

const column = createColumnHelper<CustomerProfile>();

export default function PatientListView() {
  const navigate = useNavigate();
  const patients = useQuery({
    queryKey: ['customers', 'table'],
    queryFn: () => api.searchCustomers(''),
    staleTime: 30_000,
  });
  const columns = useMemo(
    () => [
      column.accessor('name', {
        header: 'Pasien',
        cell: (info) => (
          <button
            type='button'
            onClick={() => navigate(`/patients/${info.row.original.id}`)}
            className='flex items-center gap-3 text-left'
          >
            <Avatar name={info.getValue()} />
            <span>
              <span className='block text-sm font-semibold text-slate-800 hover:text-rata-red'>
                {info.getValue()}
              </span>
              <span className='mt-0.5 block text-[11px] text-slate-400'>
                {info.row.original.id}
              </span>
            </span>
          </button>
        ),
      }),
      column.accessor('email', { header: 'Email' }),
      column.accessor('createdAt', {
        header: 'Terdaftar',
        cell: (info) =>
          new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
            new Date(info.getValue()),
          ),
      }),
      column.display({
        id: 'detail',
        header: 'Detail',
        cell: (info) => (
          <button
            type='button'
            aria-label={`Lihat ${info.row.original.name}`}
            onClick={() => navigate(`/patients/${info.row.original.id}`)}
            className='rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rata-red'
          >
            <Icon name='chevron' size={17} />
          </button>
        ),
      }),
    ],
    [navigate],
  );

  return (
    <>
      <PageHeading
        eyebrow='Manajemen klinik'
        title='Daftar Pasien'
        description='Cari dan kelola profil pasien yang tersimpan di klinik.'
        action={
          <PrimaryButton to='/patients/new'>
            <Icon name='plus' size={17} />
            Tambah pasien
          </PrimaryButton>
        }
      />
      {patients.isLoading ? (
        <p role='status' className='rounded-2xl bg-white p-8 text-center text-sm text-slate-500'>
          Memuat pasien…
        </p>
      ) : patients.error ? (
        <p role='alert' className='rounded-2xl bg-white p-8 text-sm text-rose-700'>
          {patients.error.message}
        </p>
      ) : (
        <DataTable
          data={patients.data ?? []}
          columns={columns}
          searchPlaceholder='Cari nama, email, atau ID…'
          emptyMessage='Belum ada pasien.'
          getRowId={(patient) => patient.id}
          searchableText={(patient) =>
            [
              patient.id,
              patient.name,
              patient.email,
              patient.phone,
              patient.address,
              patient.treatment,
              patient.status,
            ]
              .filter(Boolean)
              .join(' ')
          }
        />
      )}
    </>
  );
}
