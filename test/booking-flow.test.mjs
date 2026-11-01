import test from 'node:test'
import assert from 'node:assert/strict'
import { bookingVariables, canCustomerCancel, canRoleUpdateStatus } from '../src/data-services/appointment-rules.ts'

test('customer booking sends the selected time as UTC ISO and omits customerId', () => {
  const variables = bookingVariables('Kontrol', 'doctor-id', '2026-11-03T09:30:00+07:00')
  assert.deepEqual(variables, { objective: 'Kontrol', doctorId: 'doctor-id', scheduledAt: '2026-11-03T02:30:00.000Z' })
  assert.equal(Object.hasOwn(variables, 'customerId'), false)
})

test('cancellation and status actions follow the backend role and timing rules', () => {
  const now = Date.parse('2026-11-01T00:00:00.000Z')
  assert.equal(canCustomerCancel('REQUESTED', '2026-11-02T00:00:00.000Z', now), true)
  assert.equal(canCustomerCancel('CONFIRMED', '2026-11-01T23:59:00.000Z', now), false)
  assert.equal(canCustomerCancel('COMPLETED', '2026-11-04T00:00:00.000Z', now), false)
  assert.equal(canRoleUpdateStatus('CUSTOMER', 'REQUESTED', 'CONFIRMED'), false)
  assert.equal(canRoleUpdateStatus('DOCTOR', 'REQUESTED', 'CONFIRMED'), true)
  assert.equal(canRoleUpdateStatus('DOCTOR', 'REQUESTED', 'COMPLETED'), false)
})
