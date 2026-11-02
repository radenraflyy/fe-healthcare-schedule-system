import * as yup from 'yup';

import { yupResolver } from '../../../lib/yup-resolver.ts';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const optionalUuid = yup
  .string()
  .trim()
  .nullable()
  .transform((value, originalValue) => (originalValue === '' ? null : value))
  .matches(uuidPattern, {
    message: 'User ID harus berupa UUID yang valid.',
    excludeEmptyString: true,
  });

export const doctorSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Nama dokter minimal 2 karakter.')
    .max(120, 'Nama dokter maksimal 120 karakter.')
    .required('Nama dokter wajib diisi.'),
  userId: optionalUuid,
});
export const doctorResolver = yupResolver<{ name: string; userId: string }>(doctorSchema);

export const doctorAvailabilitySchema = yup.object({
  doctorId: yup
    .string()
    .matches(uuidPattern, 'Pilih dokter yang valid.')
    .required('Dokter wajib dipilih.'),
  dayOfWeek: yup.number().integer().min(0).max(6).required('Pilih hari praktik.'),
  startTime: yup
    .string()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, 'Jam mulai belum valid.')
    .required('Jam mulai wajib diisi.'),
  endTime: yup
    .string()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, 'Jam selesai belum valid.')
    .required('Jam selesai wajib diisi.')
    .test('after-start', 'Jam selesai harus setelah jam mulai.', function (value) {
      return !value || !this.parent.startTime || value > this.parent.startTime;
    }),
  slotMinutes: yup
    .number()
    .integer()
    .oneOf([15, 20, 30, 45, 60], 'Pilih durasi slot yang tersedia.')
    .required('Durasi slot wajib dipilih.'),
});
export const doctorAvailabilityResolver = yupResolver<{
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
}>(doctorAvailabilitySchema);
