import { Star } from 'lucide-react'

import type { ProductSummaryResponse } from '../../../client'
import { formatRating, formatRupiah } from './format'
import { ProductFavoriteButton } from './product-favorite-button'

type ProductCardProps = {
  product: ProductSummaryResponse
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <a
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      href={`/products/${product.id}`}
    >
      <div className="relative aspect-[5/4] bg-slate-100">
        {product.photoUrl ? (
          <img
            alt={product.name}
            className="size-full object-cover"
            src={product.photoUrl}
          />
        ) : (
          <div className="flex size-full items-center justify-center px-3 text-center text-xs leading-4 text-slate-400">
            Tidak ada foto
          </div>
        )}
        <ProductFavoriteButton productId={product.id} />
      </div>
      <div className="space-y-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium leading-5 text-slate-800">
            {product.name}
          </h3>
          <p className="truncate text-xs leading-4 text-slate-500">
            {product.store.name}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm leading-5 text-[#1e40af]">
            {formatRupiah(product.price)}
          </p>
          <div className="flex shrink-0 items-center gap-1 text-xs leading-4 text-slate-700">
            <Star
              aria-hidden="true"
              className="size-3.5 text-amber-400"
              fill="currentColor"
            />
            <span>{formatRating(product.rating)}</span>
          </div>
        </div>
      </div>
    </a>
  )
}
