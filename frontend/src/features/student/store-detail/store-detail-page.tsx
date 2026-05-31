import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Clock, MapPin, ShoppingCart, Star } from 'lucide-react'

import {
  getDetailStoresIdGetOptions,
  getProductsByStoreStoresStoreIdProductsGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import { ProductCard } from '../browse/product-card'
import { ProductCategoryTabs } from '../browse/product-category-tabs'
import type { ProductCategoryFilter } from '../browse/product-category'
import { ProductListSkeleton } from '../browse/product-list-skeleton'
import { StoreFavoriteButton } from '../browse/store-favorite-button'
import { formatRating } from '../browse/format'

type StoreDetailPageProps = {
  category: ProductCategoryFilter
  onCategoryChange: (category: ProductCategoryFilter) => void
  storeId: string
}

export function StoreDetailPage({
  category,
  onCategoryChange,
  storeId,
}: StoreDetailPageProps) {
  const storeQuery = useQuery(
    getDetailStoresIdGetOptions({
      path: {
        id: storeId,
      },
    }),
  )
  const productsQuery = useQuery(
    getProductsByStoreStoresStoreIdProductsGetOptions({
      path: {
        store_id: storeId,
      },
      query: {
        available: true,
        category: category ?? null,
        page: 1,
        pageSize: 20,
      },
    }),
  )
  const store = storeQuery.data
  const products = productsQuery.data?.data ?? []

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-sm bg-white">
        <header className="sticky top-0 z-10 bg-[#1e40af] px-3 py-2 text-white">
          <div className="flex h-10 items-center justify-between gap-3">
            <a
              aria-label="Kembali"
              className="flex size-10 items-center justify-center rounded-full transition hover:bg-white/10"
              href="/stores"
            >
              <ArrowLeft aria-hidden="true" className="size-6" />
            </a>
            <h1 className="text-lg font-medium leading-7">Detail UMKM</h1>
            <div className="flex items-center gap-1">
              <StoreFavoriteButton storeId={storeId} />
              <Link
                aria-label="Keranjang"
                className="flex size-10 items-center justify-center rounded-full transition hover:bg-white/10"
                to="/cart"
              >
                <ShoppingCart aria-hidden="true" className="size-6" />
              </Link>
            </div>
          </div>
        </header>

        {storeQuery.isPending ? <StoreDetailSkeleton /> : null}

        {storeQuery.isError ? (
          <div className="px-4 py-8 text-center">
            <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-sm leading-5 text-red-700">
              UMKM gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        ) : null}

        {store ? (
          <>
            <section className="border-b border-slate-200">
              <div className="aspect-[15/8] bg-slate-100">
                {store.photoUrl ? (
                  <img
                    alt={store.name}
                    className="size-full object-cover"
                    src={store.photoUrl}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm leading-5 text-slate-400">
                    Tidak ada foto
                  </div>
                )}
              </div>
              <div className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-medium leading-7 text-slate-800">
                      {store.name}
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {store.description || 'Belum ada deskripsi UMKM.'}
                    </p>
                  </div>
                  <span
                    className={[
                      'shrink-0 rounded-full px-2 py-0.5 text-xs leading-4',
                      store.isOpen
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {store.isOpen ? 'Buka' : 'Tutup'}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-5 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star
                      aria-hidden="true"
                      className="size-4 text-amber-400"
                      fill="currentColor"
                    />
                    {formatRating(store.rating)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin aria-hidden="true" className="size-4" />
                    <span className="line-clamp-1">{store.address}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock aria-hidden="true" className="size-4" />
                    08:00 - 17:00
                  </span>
                </div>
              </div>
            </section>

            <section className="px-4 py-5">
              <h3 className="text-lg font-medium leading-7 text-slate-800">
                Menu Tersedia
              </h3>
            </section>
            <ProductCategoryTabs
              activeCategory={category}
              onChange={onCategoryChange}
            />
            <section className="px-4 pb-6">
              {productsQuery.isPending ? <ProductListSkeleton /> : null}

              {productsQuery.isError ? (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
                  <p className="text-sm leading-5 text-red-700">
                    Menu gagal dimuat. Coba muat ulang halaman.
                  </p>
                </div>
              ) : null}

              {productsQuery.isSuccess && products.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center">
                  <p className="text-sm leading-5 text-slate-500">
                    Belum ada menu yang sesuai.
                  </p>
                </div>
              ) : null}

              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      storeId={storeId}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </main>
  )
}

function StoreDetailSkeleton() {
  return (
    <div>
      <div className="aspect-[15/8] animate-pulse bg-slate-100" />
      <div className="space-y-4 px-4 py-5">
        <div className="h-6 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  )
}
