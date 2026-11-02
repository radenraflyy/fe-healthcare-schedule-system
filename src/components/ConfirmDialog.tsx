export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Ya, lanjutkan',
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className='fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onCancel();
      }}
    >
      <section
        role='alertdialog'
        aria-modal='true'
        aria-labelledby='confirm-dialog-title'
        aria-describedby='confirm-dialog-description'
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !pending) onCancel();
        }}
        className='w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl'
      >
        <h2 id='confirm-dialog-title' className='text-lg font-bold text-slate-900'>
          {title}
        </h2>
        <p id='confirm-dialog-description' className='mt-2 text-sm leading-6 text-slate-600'>
          {description}
        </p>
        <div className='mt-6 flex justify-end gap-2'>
          <button
            type='button'
            autoFocus
            disabled={pending}
            onClick={onCancel}
            className='rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50'
          >
            Batal
          </button>
          <button
            type='button'
            disabled={pending}
            onClick={onConfirm}
            className='rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-wait disabled:opacity-50'
          >
            {pending ? 'Memproses…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
