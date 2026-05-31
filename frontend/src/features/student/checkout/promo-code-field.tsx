import { Tag, X } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'

import { formatRupiah } from '../browse/format'
import type { AppliedPromo } from './use-checkout-form'

type CheckoutFormValues = {
  notes: string
  promoCode: string
}

type PromoCodeFieldProps = {
  appliedPromo: AppliedPromo | null
  errorMessage: string | null
  form: UseFormReturn<CheckoutFormValues>
  isPending: boolean
  isStale: boolean
  onApply: () => void
  onRemove: () => void
}

export function PromoCodeField({
  appliedPromo,
  errorMessage,
  form,
  isPending,
  isStale,
  onApply,
  onRemove,
}: PromoCodeFieldProps) {
  const fieldError = form.formState.errors.promoCode?.message

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-medium leading-5 text-slate-800">
        Kode Promo
      </h2>

      {appliedPromo && !isStale ? (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-[#1e40af] bg-blue-50 p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1e40af]">
            <Tag aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-5 text-slate-800">
              {appliedPromo.promoCode}
            </p>
            <p className="text-xs font-medium leading-4 text-[#1e40af]">
              Hemat {formatRupiah(appliedPromo.discountAmount)}
            </p>
          </div>
          <button
            aria-label="Hapus promo"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-white"
            onClick={onRemove}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white"
            placeholder="Masukkan kode promo"
            {...form.register('promoCode', {
              onChange: () => {
                if (appliedPromo) {
                  onRemove()
                }
              },
            })}
          />
          <button
            className="h-11 shrink-0 rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c] disabled:opacity-60"
            disabled={isPending}
            onClick={onApply}
            type="button"
          >
            {isPending ? 'Cek...' : 'Pakai'}
          </button>
        </div>
      )}

      {fieldError ? (
        <p className="mt-2 text-xs leading-4 text-red-600">{fieldError}</p>
      ) : null}

      {errorMessage ? (
        <p className="mt-2 text-xs leading-4 text-red-600">{errorMessage}</p>
      ) : null}

      {isStale ? (
        <p className="mt-2 text-xs leading-4 text-amber-700">
          Isi keranjang berubah. Validasikan ulang kode promo.
        </p>
      ) : null}
    </section>
  )
}
