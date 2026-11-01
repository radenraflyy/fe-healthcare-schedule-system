import test from 'node:test'
import assert from 'node:assert/strict'
import { reorderWorkflowStep, workflowSaveInput } from '../src/data-services/workflow-order.ts'

const steps = [
  { id: 'a', title: 'Daftar', description: '', position: 0 },
  { id: 'b', title: 'Periksa', description: 'Dokter memeriksa pasien', position: 1 },
]

test('workflow steps can be reordered while positions stay contiguous', () => {
  assert.deepEqual(reorderWorkflowStep(steps, 1, -1), [
    { ...steps[1], position: 0 },
    { ...steps[0], position: 1 },
  ])
  assert.equal(reorderWorkflowStep(steps, 0, -1), steps)
})

test('workflow save payload contains ordered editable content only', () => {
  assert.deepEqual(workflowSaveInput(steps), [
    { title: 'Daftar', description: '' },
    { title: 'Periksa', description: 'Dokter memeriksa pasien' },
  ])
})
