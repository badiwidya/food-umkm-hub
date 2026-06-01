import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Pencil,
  Percent,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

import { ConfirmationDialog } from '../../../components/common/confirmation-dialog'
import type { PromoSummaryResponse } from '../../../client'
import { getAllMeStoresMePromosGetOptions } from '../../../client/@tanstack/react-query.gen'
import { useClickOutside } from '../../../lib/use-click-outside'
import { formatRupiah } from '../dashboard/format'
import { useSellerPromoActions } from './use-seller-promo-actions'

const PROMO_PAGE_SIZE = 20

type SellerPromosPageProps = {
  onPageChange: (page: number) => void
  page: number
}

export function SellerPromosPage({
  onPageChange,
  page,
}: SellerPromosPageProps) {
  const [selectedPromo, setSelectedPromo] =
    useState<PromoSummaryResponse | null>(null)
  const promosQuery = useQuery(
    getAllMeStoresMePromosGetOptions({
      query: {
        page,
        pageSize: PROMO_PAGE_SIZE,
      },
    }),
  )
  const promoActions = useSellerPromoActions()
  const promos = promosQuery.data?.data ?? []
  const totalPromos = promosQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalPromos / PROMO_PAGE_SIZE))

  return (
    <>
      <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-medium leading-7">Promo</h1>
            <p className="mt-1 truncate text-sm leading-5 text-white/80">
              Kelola promo toko
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Percent aria-hidden="true" className="size-6" />
          </div>
        </div>
      </header>

      <section className="px-4 py-5 pb-24">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium leading-7 text-slate-800">
            Daftar Promo
          </h2>
          <p className="shrink-0 text-sm leading-5 text-slate-500">
            {totalPromos} promo
          </p>
        </div>

        {promoActions.errorMessage ? (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm leading-5 text-red-700">
              {promoActions.errorMessage}
            </p>
          </div>
        ) : null}

        {promosQuery.isPending ? <SellerPromosSkeleton /> : null}

        {promosQuery.isError ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              Promo gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        ) : null}

        {promosQuery.isSuccess && promos.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center">
            <p className="text-sm leading-5 text-slate-500">Belum ada promo.</p>
          </div>
        ) : null}

        {promos.length > 0 ? (
          <>
            <div className="space-y-3">
              {promos.map((promo) => (
                <SellerPromoCard
                  isDeleting={promoActions.deletingPromoId === promo.id}
                  key={promo.id}
                  onDelete={() => setSelectedPromo(promo)}
                  promo={promo}
                />
              ))}
            </div>
            {totalPages > 1 ? (
              <PromoPagination
                onPageChange={onPageChange}
                page={page}
                totalPages={totalPages}
              />
            ) : null}
          </>
        ) : null}
      </section>

      <Link
        aria-label="Tambah promo"
        className="fixed bottom-20 left-1/2 z-20 ml-28 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#1e40af] text-white shadow-lg transition hover:bg-[#1d3a9c]"
        title="Tambah promo"
        to="/seller/promos/new"
      >
        <Plus aria-hidden="true" className="size-7" strokeWidth={2.4} />
      </Link>

      {selectedPromo ? (
        <ConfirmationDialog
          confirmLabel="Hapus"
          description={`Promo "${selectedPromo.code}" akan dihapus dari toko.`}
          errorMessage={promoActions.errorMessage}
          isPending={promoActions.deletingPromoId === selectedPromo.id}
          onClose={() => setSelectedPromo(null)}
          onConfirm={() => {
            void promoActions
              .deletePromo(selectedPromo)
              .then(() => {
                setSelectedPromo(null)
              })
              .catch(() => undefined)
          }}
          title="Hapus promo?"
          variant="destructive"
        />
      ) : null}
    </>
  )
}

type SellerPromoCardProps = {
  isDeleting: boolean
  onDelete: () => void
  promo: PromoSummaryResponse
}

function SellerPromoCard({
  isDeleting,
  onDelete,
  promo,
}: SellerPromoCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(
    () => setIsMenuOpen(false),
    isMenuOpen,
  )
  const status = getPromoStatus(promo)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1e40af]">
          <Percent aria-hidden="true" className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-medium leading-6 text-slate-800">
                {promo.code}
              </h3>
              <p className="mt-1 text-sm leading-5 text-[#1e40af]">
                {formatPromoDiscount(promo)}
              </p>
            </div>
            <div className="relative shrink-0" ref={menuRef}>
              <button
                aria-expanded={isMenuOpen}
                aria-label={`Aksi ${promo.code}`}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setIsMenuOpen((value) => !value)}
                type="button"
              >
                <EllipsisVertical aria-hidden="true" className="size-5" />
              </button>
              {isMenuOpen ? (
                <div className="absolute right-0 top-10 z-10 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <Link
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm leading-5 text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                    params={{
                      promoId: promo.id,
                    }}
                    to="/seller/promos/$promoId/edit"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    Edit
                  </Link>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm leading-5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDeleting}
                    onClick={() => {
                      setIsMenuOpen(false)
                      onDelete()
                    }}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Hapus
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-xs leading-4 text-slate-500">
              {formatPromoRequirements(promo)}
            </p>
            <div className="flex items-center gap-1.5 text-xs leading-4 text-slate-500">
              <CalendarDays aria-hidden="true" className="size-4" />
              <span className="min-w-0 truncate">
                {formatPromoDateRange(promo.startDate, promo.endDate)}
              </span>
            </div>
            <span
              className={[
                'inline-flex rounded-full px-2 py-1 text-xs font-medium leading-4',
                status.className,
              ].join(' ')}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function PromoPagination({
  onPageChange,
  page,
  totalPages,
}: {
  onPageChange: (page: number) => void
  page: number
  totalPages: number
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <button
        className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Sebelumnya
      </button>
      <p className="text-sm leading-5 text-slate-500">
        {page} / {totalPages}
      </p>
      <button
        className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        Berikutnya
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

function SellerPromosSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          key={index}
        >
          <div className="flex items-start gap-3">
            <div className="size-12 shrink-0 animate-pulse rounded-lg bg-slate-100" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="size-9 animate-pulse rounded-lg bg-slate-100" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatPromoDiscount(promo: PromoSummaryResponse) {
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

  return `${formatter.format(new Date(startDate))} - ${formatter.format(
    new Date(endDate),
  )}`
}

function getPromoStatus(promo: PromoSummaryResponse) {
  const now = Date.now()
  const startTime = new Date(promo.startDate).getTime()
  const endTime = new Date(promo.endDate).getTime()

  if (now < startTime) {
    return {
      className: 'bg-blue-50 text-blue-700',
      label: 'Akan datang',
    }
  }

  if (now > endTime) {
    return {
      className: 'bg-slate-100 text-slate-500',
      label: 'Berakhir',
    }
  }

  return {
    className: 'bg-emerald-50 text-emerald-700',
    label: 'Aktif',
  }
}
