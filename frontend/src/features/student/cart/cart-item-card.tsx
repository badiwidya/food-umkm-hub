import { Minus, Plus, Trash2 } from 'lucide-react'

import type { CartItem } from '../../../stores/cart-store'
import { formatRupiah } from '../browse/format'

type CartItemCardProps = {
  item: CartItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  storeName: string
}

export function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
  storeName,
}: CartItemCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {item.photoUrl ? (
            <img
              alt={item.productName}
              className="size-full object-cover"
              src={item.photoUrl}
            />
          ) : (
            <div className="flex size-full items-center justify-center px-2 text-center text-xs leading-4 text-slate-400">
              Tidak ada foto
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-medium leading-5 text-slate-800">
                {item.productName}
              </h3>
              <p className="mt-1 truncate text-xs leading-4 text-slate-500">
                {storeName}
              </p>
              <p className="mt-2 text-sm leading-5 text-[#1e40af]">
                {formatRupiah(item.price)}
              </p>
            </div>
            <button
              aria-label={`Hapus ${item.productName}`}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50"
              onClick={onRemove}
              type="button"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {item.note ? (
        <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          Catatan: {item.note}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-end">
        <div className="flex h-9 items-center rounded-lg bg-slate-100 px-1">
          <button
            aria-label={`Kurangi ${item.productName}`}
            className="flex size-8 items-center justify-center rounded-md text-slate-700 transition hover:bg-white disabled:opacity-40"
            disabled={item.quantity === 1}
            onClick={() => onQuantityChange(item.quantity - 1)}
            type="button"
          >
            <Minus aria-hidden="true" className="size-4" />
          </button>
          <span className="w-10 text-center text-sm leading-5 text-slate-800">
            {item.quantity}
          </span>
          <button
            aria-label={`Tambah ${item.productName}`}
            className="flex size-8 items-center justify-center rounded-md text-slate-700 transition hover:bg-white"
            onClick={() => onQuantityChange(item.quantity + 1)}
            type="button"
          >
            <Plus aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
