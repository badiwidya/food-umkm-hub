import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Clock, MapPin, ShoppingCart, Star, Tag } from 'lucide-react'

import {
  getAllPromoStoresStoreIdPromosGetOptions,
  getDetailStoresIdGetOptions,
  getProductsByStoreStoresStoreIdProductsGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import type { PromoSummaryResponse } from '../../../client'
import { ProductCard } from '../browse/product-card'
import { ProductCategoryTabs } from '../browse/product-category-tabs'
import type { ProductCategoryFilter } from '../browse/product-category'
import { ProductListSkeleton } from '../browse/product-list-skeleton'
import { StoreFavoriteButton } from '../browse/store-favorite-button'
import { formatRupiah } from '../browse/format'
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
  const promoQuery = useQuery(
    getAllPromoStoresStoreIdPromosGetOptions({
      path: {
        store_id: storeId,
      },
      query: {
        page: 1,
        pageSize: 3,
      },
    }),
  )
  const store = storeQuery.data
  const products = productsQuery.data?.data ?? []
  const promos = promoQuery.data?.data ?? []

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

            <section className="border-b border-slate-200 bg-slate-50 px-4 py-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-medium leading-7 text-slate-800">
                  Promo Tersedia
                </h3>
                {promoQuery.isPending ? (
                  <span className="text-xs leading-4 text-slate-400">
                    Memuat...
                  </span>
                ) : null}
              </div>

              {promoQuery.isPending ? (
                <div className="mt-4 space-y-3">
                  <div className="h-24 animate-pulse rounded-lg bg-white" />
                  <div className="h-24 animate-pulse rounded-lg bg-white" />
                </div>
              ) : null}

              {promoQuery.isSuccess && promos.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {promos.map((promo) => (
                    <PromoCard key={promo.id} promo={promo} />
                  ))}
                </div>
              ) : null}

              {promoQuery.isSuccess && promos.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-blue-50 text-[#1e40af]">
                    <Tag aria-hidden="true" className="size-5" />
                  </div>
                  <p className="mt-3 text-sm leading-5 text-slate-700">
                    Belum ada promo untuk UMKM ini.
                  </p>
                  <p className="mt-1 text-xs leading-4 text-slate-400">
                    Promo aktif akan muncul di sini saat tersedia.
                  </p>
                </div>
              ) : null}

              {promoQuery.isError ? (
                <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-blue-50 text-[#1e40af]">
                    <Tag aria-hidden="true" className="size-5" />
                  </div>
                  <p className="mt-3 text-sm leading-5 text-slate-700">
                    Promo untuk UMKM ini belum tersedia.
                  </p>
                </div>
              ) : null}
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

function PromoCard({ promo }: { promo: PromoSummaryResponse }) {
  return (
    <article className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-5 text-[#1e40af]">
            {promo.code}
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-700">
            {formatPromoValue(promo)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs leading-4 text-[#1e40af]">
          {promo.type === 'percentage' ? 'Persentase' : 'Potongan tetap'}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs leading-4 text-slate-500">
        <p>{formatPromoDateRange(promo.startDate, promo.endDate)}</p>
        <p>{formatPromoRequirements(promo)}</p>
      </div>
    </article>
  )
}

function formatPromoValue(promo: PromoSummaryResponse) {
  if (promo.type === 'percentage') {
    return `Diskon ${promo.value}%`
  }

  return `Potongan ${formatRupiah(promo.value)}`
}

function formatPromoRequirements(promo: PromoSummaryResponse) {
  const requirements: Array<string> = []

  if (promo.minOrderAmount !== null) {
    requirements.push(`Min. belanja ${formatRupiah(promo.minOrderAmount)}`)
  }

  if (promo.maxDiscountAmount !== null) {
    requirements.push(`Maks. diskon ${formatRupiah(promo.maxDiscountAmount)}`)
  }

  return requirements.length > 0
    ? requirements.join(' · ')
    : 'Tidak ada syarat minimum.'
}

function formatPromoDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return `Berlaku ${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`
}
