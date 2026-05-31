import type { CartItem } from '../../../stores/cart-store'
import { formatRupiah } from '../browse/format'
import type { AppliedPromo } from './use-checkout-form'

type CheckoutSummaryProps = {
  appliedPromo: AppliedPromo | null
  items: Array<CartItem>
  isPromoStale: boolean
  subtotal: number
}

export function CheckoutSummary({
  appliedPromo,
  items,
  isPromoStale,
  subtotal,
}: CheckoutSummaryProps) {
  const discountAmount =
    appliedPromo && !isPromoStale ? appliedPromo.discountAmount : 0
  const total =
    appliedPromo && !isPromoStale ? appliedPromo.finalAmount : subtotal

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-medium leading-5 text-slate-800">
        Ringkasan Pembayaran
      </h2>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm leading-5">
          <span className="text-slate-500">Subtotal</span>
          <span className="text-slate-800">{formatRupiah(subtotal)}</span>
        </div>
        {discountAmount > 0 ? (
          <div className="flex items-center justify-between gap-4 text-sm leading-5">
            <span className="text-red-600">Diskon Promo</span>
            <span className="text-red-600">
              - {formatRupiah(discountAmount)}
            </span>
          </div>
        ) : null}
        <div className="border-t border-slate-200 pt-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm leading-5 text-slate-800">
              Total Pembayaran
            </span>
            <span className="text-lg leading-7 text-[#1e40af]">
              {formatRupiah(total)}
            </span>
          </div>
        </div>
        <p className="text-xs leading-4 text-slate-400">
          {items.length} produk dari keranjang.
        </p>
      </div>
    </section>
  )
}
