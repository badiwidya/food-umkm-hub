import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Eye, Store } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { AdminStatusBadge } from '../components/admin-status-badge'
import { ConfirmModal } from '../components/confirm-modal'
import { EmptyState } from '../components/empty-state'
import { FilterTabs } from '../components/filter-tabs'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import { SearchInput } from '../components/search-input'
import { getAdminStores } from '../services/admin-service'
import type { AdminStore, AdminStoreActiveStatus } from '../types'

type StoreFilter = 'all' | AdminStoreActiveStatus

const tabs: {
  label: string
  value: StoreFilter
}[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Aktif', value: 'active' },
  { label: 'Nonaktif', value: 'inactive' },
]

export function AdminStoresPage() {
  const storesQuery = useQuery({
    queryFn: getAdminStores,
    queryKey: ['admin-stores'],
  })

  const [stores, setStores] = useState<AdminStore[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<StoreFilter>('all')
  const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null)

  useEffect(() => {
    if (storesQuery.data) {
      setStores(storesQuery.data)
    }
  }, [storesQuery.data])

  const filteredStores = useMemo(() => {
    const keyword = search.toLowerCase()

    return stores.filter((store) => {
      const matchStatus =
        activeTab === 'all' || store.activeStatus === activeTab
      const matchSearch =
        store.name.toLowerCase().includes(keyword) ||
        store.ownerName.toLowerCase().includes(keyword) ||
        store.location.toLowerCase().includes(keyword)

      return matchStatus && matchSearch
    })
  }, [activeTab, search, stores])

  function toggleStoreStatus(storeId: string) {
    setStores((currentStores) =>
      currentStores.map((store) =>
        store.id === storeId
          ? {
              ...store,
              activeStatus:
                store.activeStatus === 'active' ? 'inactive' : 'active',
            }
          : store,
      ),
    )
    setSelectedStore(null)
  }

  return (
    <>
      <PageHeader
        description="Pantau lokasi, status, dan produk dari seluruh UMKM."
        title="Data UMKM"
      />

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <SearchInput
          onChange={setSearch}
          placeholder="Cari nama UMKM, pemilik, atau lokasi..."
          value={search}
        />
        <FilterTabs
          activeValue={activeTab}
          onChange={setActiveTab}
          tabs={tabs}
        />
      </div>

      {storesQuery.isPending ? <LoadingState /> : null}

      {storesQuery.isSuccess && filteredStores.length === 0 ? (
        <EmptyState
          description="Tidak ada UMKM yang sesuai dengan pencarian atau filter."
          icon={<Store className="size-6" />}
          title="UMKM kosong"
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredStores.map((store) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            key={store.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {store.name}
                </h2>
                <p className="text-sm text-slate-500">{store.ownerName}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <AdminStatusBadge status={store.activeStatus} />
                <AdminStatusBadge status={store.verificationStatus} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Lokasi" value={store.location} />
              <Info label="Kategori" value={store.category} />
              <Info label="Jumlah produk" value={`${store.productCount} produk`} />
              <Info label="Jumlah pesanan" value={`${store.orderCount} pesanan`} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#006B3F] px-3 text-sm font-medium text-white hover:bg-[#004D2E]"
                params={{ storeId: store.id }}
                to="/admin/stores/$storeId"
              >
                <Eye className="size-4" />
                Detail
              </Link>

              <button
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setSelectedStore(store)}
                type="button"
              >
                {store.activeStatus === 'active'
                  ? 'Nonaktifkan'
                  : 'Aktifkan'}
              </button>
            </div>
          </article>
        ))}
      </div>

      <ConfirmModal
        danger={selectedStore?.activeStatus === 'active'}
        description={
          selectedStore
            ? `Status ${selectedStore.name} akan diubah.`
            : 'Status UMKM akan diubah.'
        }
        onCancel={() => setSelectedStore(null)}
        onConfirm={() => {
          if (selectedStore) {
            toggleStoreStatus(selectedStore.id)
          }
        }}
        open={Boolean(selectedStore)}
        title="Konfirmasi status UMKM"
      />
    </>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  )
}
