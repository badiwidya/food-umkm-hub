import { useQuery } from '@tanstack/react-query'

import {
  listFavoriteProductsFavoritesProductsGetOptions,
  listFavoriteStoresFavoritesStoresGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import { ProductCard } from '../browse/product-card'
import { ProductListSkeleton } from '../browse/product-list-skeleton'
import { StoreCard } from '../browse/store-card'
import { StoreListSkeleton } from '../browse/store-list-skeleton'
import { StudentTopHeader } from '../layout'

export type FavoritesTab = 'products' | 'stores'

type FavoritesPageProps = {
  activeTab: FavoritesTab
  onTabChange: (tab: FavoritesTab) => void
}

export function FavoritesPage({ activeTab, onTabChange }: FavoritesPageProps) {
  const favoriteProductsQuery = useQuery(
    listFavoriteProductsFavoritesProductsGetOptions({
      query: {
        page: 1,
        pageSize: 20,
      },
    }),
  )
  const favoriteStoresQuery = useQuery(
    listFavoriteStoresFavoritesStoresGetOptions({
      query: {
        page: 1,
        pageSize: 20,
      },
    }),
  )
  const favoriteProducts = favoriteProductsQuery.data?.data ?? []
  const favoriteStores = favoriteStoresQuery.data?.data ?? []

  return (
    <>
      <StudentTopHeader subtitle="Menu dan UMKM favorit Anda" title="Favorit" />
      <div className="border-b border-slate-200 px-4 py-2">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-50 p-1">
          <button
            className={[
              'h-9 rounded-md text-sm font-medium leading-5 transition',
              activeTab === 'products'
                ? 'bg-[#1e40af] text-white'
                : 'text-slate-500 hover:bg-white',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onTabChange('products')}
            type="button"
          >
            Menu Produk
          </button>
          <button
            className={[
              'h-9 rounded-md text-sm font-medium leading-5 transition',
              activeTab === 'stores'
                ? 'bg-[#1e40af] text-white'
                : 'text-slate-500 hover:bg-white',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onTabChange('stores')}
            type="button"
          >
            UMKM
          </button>
        </div>
      </div>
      <section className="px-4 py-5">
        {activeTab === 'products' ? (
          <>
            {favoriteProductsQuery.isPending ? <ProductListSkeleton /> : null}
            {favoriteProductsQuery.isError ? (
              <ErrorState message="Produk favorit gagal dimuat." />
            ) : null}
            {favoriteProductsQuery.isSuccess &&
            favoriteProducts.length === 0 ? (
              <EmptyState message="Belum ada produk favorit." />
            ) : null}
            {favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {favoriteProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <>
            {favoriteStoresQuery.isPending ? <StoreListSkeleton /> : null}
            {favoriteStoresQuery.isError ? (
              <ErrorState message="UMKM favorit gagal dimuat." />
            ) : null}
            {favoriteStoresQuery.isSuccess && favoriteStores.length === 0 ? (
              <EmptyState message="Belum ada UMKM favorit." />
            ) : null}
            {favoriteStores.length > 0 ? (
              <div className="space-y-3">
                {favoriteStores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center">
      <p className="text-sm leading-5 text-slate-500">{message}</p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
      <p className="text-sm leading-5 text-red-700">
        {message} Coba muat ulang halaman.
      </p>
    </div>
  )
}
