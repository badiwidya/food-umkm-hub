import type { TopSellingProductResponse } from '../../../client'

import { formatRupiah } from './format'

type TopSellingProductsCardProps = {
  products: Array<TopSellingProductResponse>
}

export function TopSellingProductsCard({
  products,
}: TopSellingProductsCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-medium leading-7 text-slate-900">
        Produk Terlaris
      </h2>

      {products.length === 0 ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <p className="text-sm leading-5 text-slate-500">
            Belum ada produk terlaris.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {products.slice(0, 3).map((product) => (
            <TopSellingProductRow key={product.productId} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

function TopSellingProductRow({
  product,
}: {
  product: TopSellingProductResponse
}) {
  return (
    <article className="flex items-center gap-3">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-center text-xs leading-4 text-slate-400">
        {product.productImage ? (
          <img
            alt=""
            aria-hidden="true"
            className="size-full object-cover"
            src={product.productImage}
          />
        ) : (
          <span className="px-2">Produk</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium leading-5 text-slate-800">
          {product.productName}
        </h3>
        <p className="mt-1 text-xs leading-4 text-slate-500">
          {product.quantitySold} terjual
        </p>
      </div>
      <p className="shrink-0 text-sm leading-5 text-[#1e40af]">
        {formatRupiah(product.revenue)}
      </p>
    </article>
  )
}
