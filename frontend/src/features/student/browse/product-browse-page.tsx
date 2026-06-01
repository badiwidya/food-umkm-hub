import { useQuery } from '@tanstack/react-query'

import { getAllProductsProductsGetOptions } from '../../../client/@tanstack/react-query.gen'
import { StudentTopHeader } from '../layout'
import { ProductCard } from './product-card'
import { ProductCategoryTabs } from './product-category-tabs'
import type { ProductCategoryFilter } from './product-category'
import { ProductListSkeleton } from './product-list-skeleton'
import { ProductSearchForm } from './product-search-form'

type ProductBrowsePageProps = {
  category: ProductCategoryFilter
  onCategoryChange: (category: ProductCategoryFilter) => void
  onSearchSubmit: (search: string) => void
  search: string
}

export function ProductBrowsePage({
  category,
  onCategoryChange,
  onSearchSubmit,
  search,
}: ProductBrowsePageProps) {
  const productsQuery = useQuery(
    getAllProductsProductsGetOptions({
      query: {
        available: true,
        category: category ?? null,
        page: 1,
        pageSize: 20,
        search: search || null,
        store_open: true,
      },
    }),
  )
  const products = productsQuery.data?.data ?? []
  const totalProducts = productsQuery.data?.total ?? 0

  return (
    <>
      <StudentTopHeader subtitle="Kampus IPB Dramaga" title="Food & UMKM Hub">
        <ProductSearchForm defaultSearch={search} onSubmit={onSearchSubmit} />
      </StudentTopHeader>
      <ProductCategoryTabs
        activeCategory={category}
        onChange={onCategoryChange}
      />
      <section className="px-4 pb-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium leading-7 text-slate-800">
            Produk Tersedia
          </h2>
          <p className="shrink-0 text-sm leading-5 text-slate-500">
            {totalProducts} produk
          </p>
        </div>

        {productsQuery.isPending ? <ProductListSkeleton /> : null}

        {productsQuery.isError ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              Produk gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        ) : null}

        {productsQuery.isSuccess && products.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center">
            <p className="text-sm leading-5 text-slate-500">
              Tidak ada produk yang sesuai.
            </p>
          </div>
        ) : null}

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  )
}
