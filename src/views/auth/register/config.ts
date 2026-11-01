import * as yup from 'yup';

import { yupResolver } from '../../../lib/yup-resolver.ts';

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter.')
    .max(120, 'Nama maksimal 120 karakter.')
    .required('Nama lengkap wajib diisi.'),
  email: yup
    .string()
    .trim()
    .email('Format email belum valid.')
    .max(254, 'Email maksimal 254 karakter.')
    .required('Email wajib diisi.'),
  password: yup
    .string()
    .min(8, 'Kata sandi minimal 8 karakter.')
    .required('Kata sandi wajib diisi.'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Konfirmasi kata sandi belum sama.')
    .required('Konfirmasi kata sandi wajib diisi.'),
  accepted: yup
    .boolean()
    .oneOf([true], 'Setujui Syarat & Ketentuan dan Kebijakan Privasi untuk melanjutkan.')
    .required('Persetujuan wajib diisi.'),
});

export const registerResolver = yupResolver<{
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  accepted: boolean;
}>(registerSchema);
