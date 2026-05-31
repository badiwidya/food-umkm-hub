import { formatRupiah } from '../browse/format'

type CartSummaryProps = {
  itemCount: number
  subtotal: number
}

export function CartSummary({ itemCount, subtotal }: CartSummaryProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-medium leading-5 text-slate-800">
        Ringkasan Belanja
      </h2>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm leading-5">
          <span className="text-slate-500">Subtotal ({itemCount} item)</span>
          <span className="text-slate-800">{formatRupiah(subtotal)}</span>
        </div>
        <div className="border-t border-slate-200 pt-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm leading-5 text-slate-800">Total</span>
            <span className="text-lg leading-7 text-[#1e40af]">
              {formatRupiah(subtotal)}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
