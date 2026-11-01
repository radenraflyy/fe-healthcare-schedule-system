import test from 'node:test'
import assert from 'node:assert/strict'
import { isNotificationUnread } from '../src/data-services/appointment-rules.ts'

test('notification read state is derived from readAt', () => {
  assert.equal(isNotificationUnread(null), true)
  assert.equal(isNotificationUnread('2026-11-01T08:00:00.000Z'), false)
})
