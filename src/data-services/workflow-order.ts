import type { WorkflowStep, WorkflowStepInput } from '../types/workflow';

export function reorderWorkflowStep(steps: WorkflowStep[], index: number, direction: -1 | 1) {
  const destination = index + direction;
  if (index < 0 || destination < 0 || index >= steps.length || destination >= steps.length)
    return steps;
  const reordered = [...steps];
  [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
  return reordered.map((step, position) => ({ ...step, position }));
}

export function workflowSaveInput(steps: WorkflowStep[]): WorkflowStepInput[] {
  return steps.map(({ title, description }) => ({ title, description }));
}
