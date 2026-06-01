import { useQuery } from '@tanstack/react-query'

import { listStoresGetOptions } from '../../../client/@tanstack/react-query.gen'
import { StudentTopHeader } from '../layout'
import { StoreCard } from './store-card'
import { StoreListSkeleton } from './store-list-skeleton'
import { StoreSearchForm } from './store-search-form'

type StoreBrowsePageProps = {
  onSearchSubmit: (search: string) => void
  search: string
}

export function StoreBrowsePage({
  onSearchSubmit,
  search,
}: StoreBrowsePageProps) {
  const storesQuery = useQuery(
    listStoresGetOptions({
      query: {
        page: 1,
        pageSize: 20,
        search: search || null,
      },
    }),
  )
  const stores = storesQuery.data?.data ?? []
  const totalStores = storesQuery.data?.total ?? 0

  return (
    <>
      <StudentTopHeader subtitle="Daftar UMKM di Kampus IPB" title="UMKM IPB">
        <StoreSearchForm defaultSearch={search} onSubmit={onSearchSubmit} />
      </StudentTopHeader>
      <section className="px-4 py-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium leading-7 text-slate-800">
            UMKM Tersedia
          </h2>
          <p className="shrink-0 text-sm leading-5 text-slate-500">
            {totalStores} UMKM
          </p>
        </div>

        {storesQuery.isPending ? <StoreListSkeleton /> : null}

        {storesQuery.isError ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              UMKM gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        ) : null}

        {storesQuery.isSuccess && stores.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center">
            <p className="text-sm leading-5 text-slate-500">
              Tidak ada UMKM yang sesuai.
            </p>
          </div>
        ) : null}

        {stores.length > 0 ? (
          <div className="space-y-3">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  )
}
