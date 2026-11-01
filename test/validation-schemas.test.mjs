import test from 'node:test'
import assert from 'node:assert/strict'
import { registerSchema } from '../src/views/auth/register/config.ts'
import { patientSchema } from '../src/views/patients/config.ts'
import { bookingSchema } from '../src/views/appointments/booking/config.ts'
import { doctorAvailabilitySchema } from '../src/views/doctors/management/config.ts'
import { loginResolver } from '../src/views/auth/login/config.ts'

test('TanStack Yup resolver reports field issues through Standard Schema', async () => {
  const result = await loginResolver['~standard'].validate({ email: 'invalid', password: '' })
  assert.deepEqual(result.issues?.map((issue) => issue.message), [
    'Format email belum valid.',
    'Kata sandi wajib diisi.',
  ])
})

test('register schema validates email, password confirmation, and consent', async () => {
  await assert.rejects(registerSchema.validate({
    name: 'A', email: 'invalid', password: 'short', confirmPassword: 'different', accepted: false,
  }, { abortEarly: false }), (error) => {
    const paths = error.inner.map((item) => item.path)
    assert.ok(paths.includes('name'))
    assert.ok(paths.includes('email'))
    assert.ok(paths.includes('password'))
    assert.ok(paths.includes('confirmPassword'))
    assert.ok(paths.includes('accepted'))
    return true
  })
})

test('patient schema accepts optional profile data and validates account UUID', async () => {
  await assert.rejects(patientSchema.validate({
    name: 'Patient Name', email: 'patient@example.com', userId: 'not-a-uuid', gender: '', status: '',
    phone: '', birthDate: '', address: '', treatment: '', nextVisit: '', note: '',
  }, { abortEarly: false }), (error) => error.inner.some((item) => item.path === 'userId'))

  const value = await patientSchema.validate({
    name: 'Patient Name', email: 'patient@example.com', userId: '', gender: '', status: 'ACTIVE',
    phone: '', birthDate: '', address: '', treatment: '', nextVisit: '', note: '',
  })
  assert.equal(value.userId, null)
  assert.equal(value.gender, null)
})

test('booking and availability schemas reject unavailable slots and invalid time ranges', async () => {
  await assert.rejects(bookingSchema(['2026-11-05T02:00:00.000Z']).validate({
    doctorId: 'e9db0844-6150-4fa9-8d20-f17356cf1fcb', date: '2026-11-05',
    slot: '2026-11-05T03:00:00.000Z', objective: 'Konsultasi kesehatan',
  }, { abortEarly: false }), (error) => error.inner.some((item) => item.path === 'slot'))

  await assert.rejects(doctorAvailabilitySchema.validate({
    doctorId: 'e9db0844-6150-4fa9-8d20-f17356cf1fcb', dayOfWeek: 2,
    startTime: '14:00', endTime: '13:00', slotMinutes: 30,
  }, { abortEarly: false }), (error) => error.inner.some((item) => item.path === 'endTime'))
})
