import { useQuery } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { AdminStatusBadge } from '../components/admin-status-badge'
import { ConfirmModal } from '../components/confirm-modal'
import { EmptyState } from '../components/empty-state'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import {
  getAdminStores,
  updateStoreVerification,
} from '../services/admin-service'
import type { AdminStore, AdminVerificationStatus } from '../types'

export function AdminVerificationPage() {
  const storesQuery = useQuery({
    queryFn: getAdminStores,
    queryKey: ['admin-stores'],
  })

  const [stores, setStores] = useState<AdminStore[]>([])
  const [selectedAction, setSelectedAction] = useState<{
    storeId: string
    status: AdminVerificationStatus
  } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (storesQuery.data) {
      setStores(storesQuery.data)
    }
  }, [storesQuery.data])

  const pendingStores = useMemo(
    () => stores.filter((store) => store.verificationStatus === 'pending'),
    [stores],
  )

  async function handleVerification(
    storeId: string,
    status: AdminVerificationStatus,
  ) {
    await updateStoreVerification(storeId, status)
    setStores((currentStores) =>
      currentStores.map((store) =>
        store.id === storeId
          ? {
              ...store,
              verificationStatus: status,
            }
          : store,
      ),
    )
    setSelectedAction(null)
    setRejectReason('')
  }

  return (
    <>
      <PageHeader
        description="Tinjau dan verifikasi UMKM yang baru mendaftar."
        title="Verifikasi UMKM"
      />

      {storesQuery.isPending ? <LoadingState /> : null}

      {storesQuery.isSuccess && pendingStores.length === 0 ? (
        <EmptyState
          description="Tidak ada UMKM yang sedang menunggu verifikasi."
          icon={<ShieldCheck className="size-6" />}
          title="Tidak ada antrian verifikasi"
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {pendingStores.map((store) => (
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
              <AdminStatusBadge status={store.verificationStatus} />
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Email" value={store.ownerEmail} />
              <Info label="No HP" value={store.ownerPhone} />
              <Info label="Lokasi" value={store.location} />
              <Info label="Kategori" value={store.category} />
              <Info
                label="Jam operasional"
                value={`${store.openTime} - ${store.closeTime}`}
              />
              <Info label="Dokumen" value="Belum tersedia" />
            </div>

            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              {store.description}
            </p>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">
                Alasan penolakan
              </span>
              <textarea
                className="input-admin mt-2 min-h-20"
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Isi jika UMKM ditolak"
                value={rejectReason}
              />
            </label>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                className="h-11 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 hover:bg-red-100"
                onClick={() =>
                  setSelectedAction({
                    status: 'rejected',
                    storeId: store.id,
                  })
                }
                type="button"
              >
                Tolak
              </button>
              <button
                className="h-11 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white hover:bg-[#004D2E]"
                onClick={() =>
                  setSelectedAction({
                    status: 'verified',
                    storeId: store.id,
                  })
                }
                type="button"
              >
                Setujui
              </button>
            </div>
          </article>
        ))}
      </div>

      <ConfirmModal
        danger={selectedAction?.status === 'rejected'}
        description={
          selectedAction?.status === 'rejected'
            ? 'UMKM akan ditolak dan alasan penolakan dapat dikirimkan ke penjual.'
            : 'UMKM akan disetujui dan statusnya menjadi verified.'
        }
        onCancel={() => setSelectedAction(null)}
        onConfirm={() => {
          if (selectedAction) {
            void handleVerification(
              selectedAction.storeId,
              selectedAction.status,
            )
          }
        }}
        open={Boolean(selectedAction)}
        title="Konfirmasi verifikasi UMKM"
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
