import { useState } from 'react';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Icon } from '../../components/Icon';
import { PageHeading } from '../../components/PageHeading';
import { PrimaryButton } from '../../components/PrimaryButton';
import { api } from '../../data-services/api';
import { reorderWorkflowStep, workflowSaveInput } from '../../data-services/workflow-order';
import type { WorkflowStep } from '../../types/workflow';
import { workflowStepResolver } from './config';

const inputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none placeholder:text-slate-300 focus:border-rata-red/50 focus:ring-3 focus:ring-rata-red/10';

export default function WorkflowView() {
  const queryClient = useQueryClient();
  const workflow = useQuery({
    queryKey: ['workflowSteps'],
    queryFn: () => api.workflowSteps(),
    staleTime: 30_000,
  });
  const [draft, setDraft] = useState<WorkflowStep[] | null>(null);
  const form = useForm({
    defaultValues: { title: '', description: '' },
    validators: { onSubmitAsync: workflowStepResolver },
    onSubmit: async ({ value }) => addStep(value),
  });
  const steps = draft ?? workflow.data?.workflowSteps ?? [];
  const isDirty = draft !== null;
  const save = useMutation({
    mutationFn: (nextSteps: ReturnType<typeof workflowSaveInput>) =>
      api.saveWorkflowSteps(nextSteps),
    onSuccess: ({ saveWorkflowSteps }) => {
      queryClient.setQueryData(['workflowSteps'], { workflowSteps: saveWorkflowSteps });
      setDraft(null);
    },
  });

  function addStep(values: { title: string; description?: string | null }) {
    const cleanTitle = values.title.trim();
    if (steps.length >= 50) return;
    const nextStep = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      description: values.description?.trim() ?? '',
      position: steps.length,
    };
    setDraft([...steps, nextStep]);
    form.reset();
    save.reset();
  }

  function moveStep(index: number, direction: -1 | 1) {
    setDraft(reorderWorkflowStep(steps, index, direction));
    save.reset();
  }

  function removeStep(id: string) {
    setDraft(
      steps.filter((step) => step.id !== id).map((step, position) => ({ ...step, position })),
    );
    save.reset();
  }

  function saveWorkflow() {
    save.mutate(workflowSaveInput(steps));
  }

  return (
    <>
      <PageHeading
        eyebrow='Operasional klinik'
        title='Workflow Klinik'
        description='Susun, urutkan, dan simpan langkah kunjungan klinik.'
        action={
          <PrimaryButton
            disabled={!isDirty || save.isPending || workflow.isLoading}
            onClick={saveWorkflow}
          >
            <Icon name='check' size={17} />
            {save.isPending ? 'Menyimpan…' : 'Simpan workflow'}
          </PrimaryButton>
        }
      />
      {workflow.isLoading && (
        <p role='status' className='mb-5 rounded-xl bg-white p-4 text-sm text-slate-500'>
          Memuat workflow…
        </p>
      )}
      {workflow.error && (
        <div
          role='alert'
          className='mb-5 flex flex-col justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center'
        >
          <span>{workflow.error.message}</span>
          <button
            onClick={() => void workflow.refetch()}
            className='self-start rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 sm:self-auto'
          >
            Coba lagi
          </button>
        </div>
      )}
      {save.isSuccess && (
        <div
          role='status'
          className='mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800'
        >
          <Icon name='check' size={16} />
          Workflow berhasil disimpan.
        </div>
      )}
      {save.error && (
        <p
          role='alert'
          className='mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'
        >
          {save.error.message}
        </p>
      )}
      <section className='mb-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]'>
        <div className='border-b border-slate-100 px-5 py-4 sm:px-6'>
          <h2 className='text-sm font-bold text-slate-800'>Pratinjau alur</h2>
          <p className='mt-1 text-xs text-slate-400'>
            Langkah ditampilkan sesuai urutan yang akan disimpan.
          </p>
        </div>
        {steps.length ? (
          <div className='overflow-x-auto px-5 py-7 sm:px-7'>
            <div className='flex min-w-max items-center justify-center gap-3 sm:gap-5'>
              {steps.map((step, index) => (
                <div key={step.id} className='flex items-center gap-3 sm:gap-5'>
                  <div className='flex min-w-[130px] max-w-[180px] flex-col items-center text-center'>
                    <div
                      className={`mb-3 flex size-11 items-center justify-center rounded-2xl text-sm font-bold ${index === 0 ? 'bg-rata-red text-white shadow-md shadow-rose-200' : 'bg-rose-50 text-rata-red'}`}
                    >
                      {index + 1}
                    </div>
                    <p className='w-full truncate text-xs font-bold text-slate-800'>{step.title}</p>
                    {step.description && (
                      <p className='mt-1 line-clamp-2 max-w-[160px] text-[10px] leading-4 text-slate-400'>
                        {step.description}
                      </p>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <Icon name='arrow' size={17} className='-mt-8 text-slate-300' />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='px-6 py-12 text-center'>
            <p className='text-sm font-semibold text-slate-700'>Workflow masih kosong</p>
            <p className='mt-1 text-xs text-slate-400'>
              Tambahkan langkah pertama untuk mulai menyusun alur.
            </p>
          </div>
        )}
      </section>
      <section className='max-w-4xl rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]'>
        <div className='flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-sm font-bold text-slate-800'>Urutan langkah</h2>
            <p className='mt-1 text-xs text-slate-400'>
              Tambah, hapus, atau ubah urutan hingga 50 langkah.
            </p>
          </div>
          <span className='self-start rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500'>
            {steps.length} / 50
          </span>
        </div>
        <div className='divide-y divide-slate-100'>
          {steps.map((step, index) => (
            <div key={step.id} className='flex items-center gap-3 px-4 py-4 sm:px-5'>
              <div className='flex size-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-xs font-bold text-rata-red'>
                {index + 1}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-slate-800'>{step.title}</p>
                <p className='mt-0.5 truncate text-xs text-slate-400'>
                  {step.description || 'Tanpa deskripsi'}
                </p>
              </div>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  aria-label={`Pindahkan ${step.title} ke atas`}
                  disabled={index === 0 || save.isPending}
                  onClick={() => moveStep(index, -1)}
                  className='rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30'
                >
                  <Icon name='up' size={15} />
                </button>
                <button
                  type='button'
                  aria-label={`Pindahkan ${step.title} ke bawah`}
                  disabled={index === steps.length - 1 || save.isPending}
                  onClick={() => moveStep(index, 1)}
                  className='rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30'
                >
                  <Icon name='down' size={15} />
                </button>
                <button
                  type='button'
                  aria-label={`Hapus langkah ${step.title}`}
                  disabled={save.isPending}
                  onClick={() => removeStep(step.id)}
                  className='rounded-lg p-2 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rata-red disabled:opacity-40'
                >
                  <Icon name='trash' size={15} />
                </button>
              </div>
            </div>
          ))}
          {!steps.length && !workflow.isLoading && (
            <p className='px-5 py-8 text-center text-xs text-slate-400'>
              Belum ada langkah workflow.
            </p>
          )}
        </div>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className='grid gap-2 border-t border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-[minmax(160px,0.8fr)_minmax(180px,1.2fr)_auto] sm:p-5'
        >
          <form.Field name='title'>
            {(field) => (
              <div>
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  maxLength={120}
                  placeholder='Nama langkah'
                  aria-label='Nama langkah'
                  className={inputClass}
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className='mt-1 block text-xs text-rose-700'>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </div>
            )}
          </form.Field>
          <form.Field name='description'>
            {(field) => (
              <div>
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  maxLength={500}
                  placeholder='Deskripsi (opsional)'
                  aria-label='Deskripsi langkah'
                  className={inputClass}
                />
                {field.state.meta.errors[0] && (
                  <span role='alert' className='mt-1 block text-xs text-rose-700'>
                    {field.state.meta.errors[0].message}
                  </span>
                )}
              </div>
            )}
          </form.Field>
          <button
            type='submit'
            disabled={steps.length >= 50 || !workflow.data || save.isPending}
            className='inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rata-red active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Icon name='plus' size={16} />
            Tambah langkah
          </button>
        </form>
      </section>
    </>
  );
}
