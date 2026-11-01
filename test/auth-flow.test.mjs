import test from 'node:test'
import assert from 'node:assert/strict'
import { safeGraphQLError } from '../src/data-services/graphql-errors.ts'

test('auth errors are actionable and never reveal token or internal stack details', () => {
  assert.equal(safeGraphQLError('invalid credentials', 'UNAUTHENTICATED'), 'Sesi Anda telah berakhir. Silakan masuk kembali.')
  assert.equal(safeGraphQLError('secret token abc123', 'BAD_USER_INPUT'), 'Data belum dapat ditemukan atau tidak valid.')
  assert.equal(safeGraphQLError('Prisma database exception', 'BAD_USER_INPUT'), 'Data belum dapat ditemukan atau tidak valid.')
  assert.equal(safeGraphQLError('Too many requests', 'TOO_MANY_REQUESTS'), 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.')
  assert.equal(safeGraphQLError('ECONNREFUSED', 'SERVICE_UNAVAILABLE'), 'Layanan sedang tidak tersedia. Coba lagi sebentar.')
})
