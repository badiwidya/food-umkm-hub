import { Edit, EyeOff, Package } from 'lucide-react'

import { formatRupiah } from '../components/format'
import type { SellerProduct } from '../types'

type ProductCardProps = {
  product: SellerProduct
  onEdit: (product: SellerProduct) => void
  onToggleActive: (productId: string) => void
  onToggleAvailable: (productId: string) => void
}

export function ProductCard({
  onEdit,
  onToggleActive,
  onToggleAvailable,
  product,
}: ProductCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-400">
          {product.imageUrl ? (
            <img
              alt={product.name}
              className="size-full object-cover"
              src={product.imageUrl}
            />
          ) : (
            <Package className="size-7" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">{product.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{product.category}</p>
            </div>

            <p className="font-semibold text-[#006B3F]">
              {formatRupiah(product.price)}
            </p>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {product.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              ± {product.estimatedMinutes} menit
            </span>
            <span
              className={[
                'rounded-full px-2.5 py-1',
                product.isAvailable
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700',
              ].join(' ')}
            >
              {product.isAvailable ? 'Tersedia' : 'Habis'}
            </span>
            <span
              className={[
                'rounded-full px-2.5 py-1',
                product.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-600',
              ].join(' ')}
            >
              {product.isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => onEdit(product)}
          type="button"
        >
          <Edit className="size-4" />
          Edit
        </button>
        <button
          className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => onToggleAvailable(product.id)}
          type="button"
        >
          {product.isAvailable ? 'Tandai Habis' : 'Tandai Tersedia'}
        </button>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50"
          onClick={() => onToggleActive(product.id)}
          type="button"
        >
          <EyeOff className="size-4" />
          {product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
      </div>
    </article>
  )
}