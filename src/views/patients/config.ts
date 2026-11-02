import * as yup from 'yup';

import type { CustomerStatus } from '../../data-services/api';
import { yupResolver } from '../../lib/yup-resolver.ts';

const optionalText = (max: number, message: string) =>
  yup
    .string()
    .trim()
    .max(max, message)
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value));
export const patientSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter.')
    .max(120, 'Nama maksimal 120 karakter.')
    .required('Nama pasien wajib diisi.'),
  email: yup
    .string()
    .trim()
    .email('Format email belum valid.')
    .max(254, 'Email maksimal 254 karakter.')
    .required('Email wajib diisi.'),
  phone: optionalText(40, 'Nomor telepon maksimal 40 karakter.'),
  gender: yup
    .mixed<'Perempuan' | 'Laki-laki' | 'Lainnya'>()
    .oneOf(['Perempuan', 'Laki-laki', 'Lainnya'], 'Pilih jenis kelamin yang tersedia.')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  birthDate: yup
    .string()
    .nullable()
    .test(
      'valid-date',
      'Tanggal lahir belum valid.',
      (value) =>
        !value ||
        (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))),
    ),
  address: optionalText(300, 'Alamat maksimal 300 karakter.'),
  treatment: optionalText(120, 'Jenis perawatan maksimal 120 karakter.'),
  status: yup
    .mixed<CustomerStatus>()
    .oneOf(['ACTIVE', 'WAITING', 'COMPLETED'], 'Pilih status perawatan yang tersedia.')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  nextVisit: yup
    .string()
    .nullable()
    .test(
      'valid-date-time',
      'Waktu kunjungan belum valid.',
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
    ),
  note: optionalText(2000, 'Catatan maksimal 2000 karakter.'),
});

export type PatientFormValues = {
  name: string;
  email: string;
  phone: string;
  gender: 'Perempuan' | 'Laki-laki' | 'Lainnya' | null;
  birthDate: string;
  address: string;
  treatment: string;
  status: CustomerStatus | null;
  nextVisit: string;
  note: string;
};
export const patientResolver = yupResolver<PatientFormValues>(patientSchema);
