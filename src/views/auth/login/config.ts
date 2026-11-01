import * as yup from 'yup';

import { yupResolver } from '../../../lib/yup-resolver.ts';

const email = yup
  .string()
  .trim()
  .email('Format email belum valid.')
  .max(254, 'Email maksimal 254 karakter.')
  .required('Email wajib diisi.');

export const loginSchema = yup.object({
  email,
  password: yup.string().required('Kata sandi wajib diisi.'),
});

export const loginResolver = yupResolver<{ email: string; password: string }>(loginSchema);
