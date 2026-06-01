import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { ProductFormPage } from '../features/seller'
import { getProductDetailsProductsIdGetOptions } from '../client/@tanstack/react-query.gen'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute(
  '/_authenticated/seller/products/$productId/edit',
)({
  head: () => titleHead('Edit Produk'),
  component: EditProductRoute,
})

function EditProductRoute() {
  const { productId } = Route.useParams()
  const productQuery = useQuery(
    getProductDetailsProductsIdGetOptions({
      path: {
        id: productId,
      },
    }),
  )
  const product = productQuery.data

  if (productQuery.isPending) {
    return <EditProductSkeleton />
  }

  if (productQuery.isError || !product) {
    return (
      <>
        <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
          <h1 className="text-xl font-medium leading-7">Edit Produk</h1>
          <p className="mt-1 text-sm leading-5 text-white/80">
            Data produk gagal dimuat
          </p>
        </header>
        <section className="px-4 py-5">
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              Produk gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        </section>
      </>
    )
  }

  return <ProductFormPage key={product.id} mode="edit" product={product} />
}

function EditProductSkeleton() {
  return (
    <>
      <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
        <div className="h-7 w-32 animate-pulse rounded bg-white/20" />
        <div className="mt-2 h-5 w-44 animate-pulse rounded bg-white/20" />
      </header>
      <section className="space-y-5 px-4 py-5">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 aspect-[4/3] animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </section>
    </>
  )
}
