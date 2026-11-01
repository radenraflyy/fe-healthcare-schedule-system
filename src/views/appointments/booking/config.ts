import * as yup from 'yup';

import { yupResolver } from '../../../lib/yup-resolver.ts';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const bookingSchema = (availableSlots?: string[]) =>
  yup.object({
    doctorId: yup
      .string()
      .matches(uuidPattern, 'Pilih dokter yang valid.')
      .required('Pilih dokter.'),
    date: yup
      .string()
      .required('Pilih tanggal konsultasi.')
      .test(
        'not-past',
        'Tanggal konsultasi tidak boleh lewat.',
        (value) => !value || value >= new Date().toLocaleDateString('sv-SE'),
      ),
    slot: yup
      .string()
      .required('Pilih waktu konsultasi.')
      .test(
        'available-slot',
        'Pilih salah satu slot yang tersedia.',
        (value) => !value || !availableSlots || availableSlots.includes(value),
      ),
    objective: yup
      .string()
      .trim()
      .min(3, 'Tujuan konsultasi minimal 3 karakter.')
      .max(500, 'Tujuan konsultasi maksimal 500 karakter.')
      .required('Tujuan konsultasi wajib diisi.'),
  });

export type BookingFormValues = { doctorId: string; date: string; slot: string; objective: string };
export const bookingResolver = yupResolver<BookingFormValues>(bookingSchema());
