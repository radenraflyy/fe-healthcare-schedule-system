import * as yup from 'yup';

import { yupResolver } from '../../lib/yup-resolver.ts';

const optionalText = (max: number, message: string) =>
  yup
    .string()
    .trim()
    .max(max, message)
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value));

export const workflowStepSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(1, 'Nama langkah wajib diisi.')
    .max(120, 'Nama langkah maksimal 120 karakter.')
    .required('Nama langkah wajib diisi.'),
  description: optionalText(500, 'Deskripsi maksimal 500 karakter.'),
});

export const workflowStepResolver = yupResolver<{ title: string; description: string }>(
  workflowStepSchema,
);
