import { useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { useMemo, useState } from 'react'

import { formatRupiah } from '../components/admin-format'
import { AdminStatusBadge } from '../components/admin-status-badge'
import { EmptyState } from '../components/empty-state'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import { SearchInput } from '../components/search-input'
import { getAdminProducts } from '../services/admin-service'

export function AdminProductsPage() {
  const productsQuery = useQuery({
    queryFn: getAdminProducts,
    queryKey: ['admin-products'],
  })

  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    const products = productsQuery.data ?? []
    const keyword = search.toLowerCase()

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.storeName.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword),
    )
  }, [productsQuery.data, search])

  return (
    <>
      <PageHeader
        description="Monitoring produk yang dijual UMKM. Admin hanya memantau, bukan menjadi pengelola utama produk."
        title="Produk UMKM"
      />

      <div className="mb-4">
        <SearchInput
          onChange={setSearch}
          placeholder="Cari produk, UMKM, atau kategori..."
          value={search}
        />
      </div>

      {productsQuery.isPending ? <LoadingState /> : null}

      {productsQuery.isSuccess && filteredProducts.length === 0 ? (
        <EmptyState
          description="Tidak ada produk yang sesuai dengan pencarian."
          icon={<Package className="size-6" />}
          title="Produk kosong"
        />
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {filteredProducts.map((product) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            key={product.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {product.name}
                </h2>
                <p className="text-sm text-slate-500">{product.storeName}</p>
              </div>

              <p className="font-semibold text-[#006B3F]">
                {formatRupiah(product.price)}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {product.category}
              </span>
              <AdminStatusBadge
                status={product.isAvailable ? 'active' : 'inactive'}
              />
              <AdminStatusBadge
                status={product.isActive ? 'active' : 'inactive'}
              />
            </div>

            <button
              className="mt-4 h-10 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              type="button"
            >
              Lihat Detail
            </button>
          </article>
        ))}
      </div>
    </>
  )
}
