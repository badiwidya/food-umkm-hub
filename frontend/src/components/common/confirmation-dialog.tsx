type ConfirmationDialogProps = {
  cancelLabel?: string
  confirmLabel: string
  description: string
  errorMessage?: string | null
  isPending?: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  variant?: 'default' | 'destructive'
}

export function ConfirmationDialog({
  cancelLabel = 'Batal',
  confirmLabel,
  description,
  errorMessage = null,
  isPending = false,
  onClose,
  onConfirm,
  title,
  variant = 'default',
}: ConfirmationDialogProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 px-4 pb-4"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
        <h3 className="text-base font-medium leading-6 text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        {errorMessage ? (
          <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
            <p className="text-sm leading-5 text-red-700">{errorMessage}</p>
          </div>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={[
              'h-11 rounded-lg px-4 text-sm font-medium leading-5 text-white transition disabled:opacity-50',
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#1e40af] hover:bg-[#1d3a9c]',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
