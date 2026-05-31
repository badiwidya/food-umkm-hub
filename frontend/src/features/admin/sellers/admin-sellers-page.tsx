import { useQuery } from '@tanstack/react-query'
import { UserCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { formatDateTime } from '../components/admin-format'
import { AdminStatusBadge } from '../components/admin-status-badge'
import { ConfirmModal } from '../components/confirm-modal'
import { EmptyState } from '../components/empty-state'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import { SearchInput } from '../components/search-input'
import {
  getAdminSellers,
  updateSellerVerification,
} from '../services/admin-service'
import type { AdminSeller, AdminVerificationStatus } from '../types'

export function AdminSellersPage() {
  const sellersQuery = useQuery({
    queryFn: getAdminSellers,
    queryKey: ['admin-sellers'],
  })

  const [sellers, setSellers] = useState<AdminSeller[]>([])
  const [search, setSearch] = useState('')
  const [selectedAction, setSelectedAction] = useState<{
    sellerId: string
    status: AdminVerificationStatus
  } | null>(null)

  useEffect(() => {
    if (sellersQuery.data) {
      setSellers(sellersQuery.data)
    }
  }, [sellersQuery.data])

  const filteredSellers = useMemo(() => {
    const keyword = search.toLowerCase()

    return sellers.filter(
      (seller) =>
        seller.name.toLowerCase().includes(keyword) ||
        seller.email.toLowerCase().includes(keyword) ||
        seller.storeName.toLowerCase().includes(keyword),
    )
  }, [search, sellers])

  async function handleVerification(
    sellerId: string,
    status: AdminVerificationStatus,
  ) {
    await updateSellerVerification(sellerId, status)

    setSellers((currentSellers) =>
      currentSellers.map((seller) =>
        seller.id === sellerId
          ? {
              ...seller,
              accountStatus: status === 'verified' ? 'active' : 'inactive',
              verificationStatus: status,
            }
          : seller,
      ),
    )
    setSelectedAction(null)
  }

  return (
    <>
      <PageHeader
        description="Verifikasi akun penjual dan pantau status akun."
        title="Data Penjual"
      />

      <div className="mb-4">
        <SearchInput
          onChange={setSearch}
          placeholder="Cari nama penjual, email, atau nama UMKM..."
          value={search}
        />
      </div>

      {sellersQuery.isPending ? <LoadingState /> : null}

      {sellersQuery.isSuccess && filteredSellers.length === 0 ? (
        <EmptyState
          description="Tidak ada penjual yang sesuai dengan pencarian."
          icon={<UserCheck className="size-6" />}
          title="Data penjual kosong"
        />
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {filteredSellers.map((seller) => (
            <article
              className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr_auto]"
              key={seller.id}
            >
              <div>
                <p className="font-semibold text-slate-900">{seller.name}</p>
                <p className="text-sm text-slate-500">{seller.email}</p>
                <p className="text-sm text-slate-500">{seller.phone}</p>
              </div>

              <div>
                <p className="font-medium text-slate-900">{seller.storeName}</p>
                <p className="text-sm text-slate-500">
                  Daftar: {formatDateTime(seller.registeredAt)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <AdminStatusBadge status={seller.accountStatus} />
                  <AdminStatusBadge status={seller.verificationStatus} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  className="h-10 rounded-xl bg-[#006B3F] px-3 text-sm font-medium text-white hover:bg-[#004D2E]"
                  onClick={() =>
                    setSelectedAction({
                      sellerId: seller.id,
                      status: 'verified',
                    })
                  }
                  type="button"
                >
                  Verifikasi
                </button>
                <button
                  className="h-10 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 hover:bg-red-100"
                  onClick={() =>
                    setSelectedAction({
                      sellerId: seller.id,
                      status: 'rejected',
                    })
                  }
                  type="button"
                >
                  Tolak
                </button>
                <button
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  type="button"
                >
                  Nonaktifkan
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <ConfirmModal
        danger={selectedAction?.status === 'rejected'}
        description="Status verifikasi penjual akan diperbarui."
        onCancel={() => setSelectedAction(null)}
        onConfirm={() => {
          if (selectedAction) {
            void handleVerification(
              selectedAction.sellerId,
              selectedAction.status,
            )
          }
        }}
        open={Boolean(selectedAction)}
        title="Konfirmasi verifikasi penjual"
      />
    </>
  )
}
