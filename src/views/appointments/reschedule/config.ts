import * as yup from 'yup';

import { yupResolver } from '../../../lib/yup-resolver.ts';

export const rescheduleSchema = (availableSlots?: string[]) =>
  yup.object({
    date: yup
      .string()
      .required('Pilih tanggal baru.')
      .test(
        'not-past',
        'Tanggal tidak boleh lewat.',
        (value) => !value || value >= new Date().toLocaleDateString('sv-SE'),
      ),
    slot: yup
      .string()
      .required('Pilih waktu baru.')
      .test(
        'available-slot',
        'Pilih salah satu slot yang tersedia.',
        (value) => !value || !availableSlots || availableSlots.includes(value),
      ),
  });

export type RescheduleFormValues = { date: string; slot: string };
export const rescheduleResolver = yupResolver<RescheduleFormValues>(rescheduleSchema());
