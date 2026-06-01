import { Store, UserRound } from 'lucide-react'

import type { StoreDetailResponse } from '../../../client'

type SellerDashboardHeaderProps = {
  errorMessage: string | null
  isError: boolean
  isPending: boolean
  isStatusPending: boolean
  onStatusToggle: (isOpen: boolean) => void
  store: StoreDetailResponse | undefined
}

export function SellerDashboardHeader({
  errorMessage,
  isError,
  isPending,
  isStatusPending,
  onStatusToggle,
  store,
}: SellerDashboardHeaderProps) {
  const title = store?.name ?? 'Dashboard Penjual'
  const subtitle = isError ? 'Profil toko gagal dimuat' : 'Kampus IPB Dramaga'
  const statusLabel = getStatusLabel({
    isPending: isStatusPending,
    isOpen: store?.isOpen,
  })

  return (
    <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
          {store?.photoUrl ? (
            <img
              alt=""
              aria-hidden="true"
              className="size-full object-cover"
              src={store.photoUrl}
            />
          ) : (
            <UserRound aria-hidden="true" className="size-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {isPending ? (
            <div className="space-y-2 py-1">
              <div className="h-5 w-44 animate-pulse rounded bg-white/20" />
              <div className="h-4 w-32 animate-pulse rounded bg-white/20" />
            </div>
          ) : (
            <>
              <h1 className="truncate text-xl font-medium leading-7">
                {title}
              </h1>
              <p className="mt-1 truncate text-sm leading-5 text-white/80">
                {subtitle}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-white/10 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Store aria-hidden="true" className="size-4 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm leading-5 text-white">Status Toko</p>
            <p className="truncate text-xs leading-4 text-white/75">
              {statusLabel}
            </p>
          </div>
        </div>
        <button
          aria-checked={store?.isOpen ?? false}
          aria-label="Ubah status operasional toko"
          className={[
            'relative h-8 w-14 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60',
            store?.isOpen
              ? 'bg-emerald-500'
              : 'bg-white/20 ring-1 ring-inset ring-white/25',
          ].join(' ')}
          disabled={!store || isPending || isStatusPending}
          onClick={() => {
            if (store) {
              onStatusToggle(store.isOpen)
            }
          }}
          role="switch"
          type="button"
        >
          <span
            className={[
              'absolute top-1 size-6 rounded-full bg-white shadow-sm transition',
              store?.isOpen ? 'left-7' : 'left-1',
            ].join(' ')}
          />
        </button>
      </div>
      {errorMessage ? (
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm leading-5 text-red-700">{errorMessage}</p>
        </div>
      ) : null}
    </header>
  )
}

function getStatusLabel({
  isOpen,
  isPending,
}: {
  isOpen: boolean | undefined
  isPending: boolean
}) {
  if (isPending) {
    return 'Memperbarui status...'
  }

  if (isOpen === undefined) {
    return 'Status belum tersedia'
  }

  return isOpen ? 'Buka / Operational' : 'Tutup / Not Operational'
}
