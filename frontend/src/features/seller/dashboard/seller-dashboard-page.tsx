import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ClipboardList,
  ImagePlus,
  PackageCheck,
  Star,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import {
  getMeStoresMeGetOptions,
  getMyDashboardStoresMeDashboardGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import { SellerDashboardHeader } from '../layout'
import { formatRating, formatRupiah } from './format'
import { SellerDashboardSkeleton } from './seller-dashboard-skeleton'
import { SellerMetricCard } from './seller-metric-card'
import { TopSellingProductsCard } from './top-selling-products-card'
import { useStoreOperationalStatus } from './use-store-operational-status'

export function SellerDashboardPage() {
  const storeQuery = useQuery(getMeStoresMeGetOptions())
  const dashboardQuery = useQuery(getMyDashboardStoresMeDashboardGetOptions())
  const storeStatus = useStoreOperationalStatus()
  const dashboard = dashboardQuery.data
  const store = storeQuery.data
  const isApprovalPending = store?.approvalStatus === 'pending'
  const isStoreProfileIncomplete = Boolean(
    store && (!store.photoUrl || !store.qrisImageUrl),
  )

  return (
    <>
      <SellerDashboardHeader
        errorMessage={storeStatus.errorMessage}
        isError={storeQuery.isError}
        isPending={storeQuery.isPending}
        isStatusPending={storeStatus.isPending}
        onStatusToggle={(isOpen) => {
          void storeStatus.toggleStatus(isOpen)
        }}
        store={store}
      />

      {store ? (
        <section className="space-y-3 px-4 pt-5">
          {isApprovalPending ? (
            <SellerDashboardNotice
              icon={AlertCircle}
              message="Pendaftaran UMKM Anda sedang menunggu persetujuan admin. Toko belum dapat beroperasi sampai proses kurasi selesai."
              tone="warning"
            />
          ) : null}

          {isStoreProfileIncomplete ? (
            <SellerDashboardNotice
              actionLabel="Lengkapi Profil Toko"
              actionTo="/seller/profile/edit-store"
              icon={ImagePlus}
              message="Lengkapi profil toko Anda agar pembeli dapat melihat informasi toko dan melakukan pembayaran dengan QRIS."
              tone="info"
            />
          ) : null}
        </section>
      ) : null}

      {dashboardQuery.isPending ? <SellerDashboardSkeleton /> : null}

      {dashboardQuery.isError ? (
        <section className="px-4 py-5">
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              Dashboard gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        </section>
      ) : null}

      {dashboard ? (
        <section className="space-y-4 px-4 py-5">
          <div className="grid grid-cols-2 gap-3">
            <SellerMetricCard
              accentClassName="bg-blue-50 text-[#1e40af]"
              icon={Wallet}
              label="Pendapatan Hari Ini"
              value={formatRupiah(dashboard.todayRevenue)}
            />
            <SellerMetricCard
              accentClassName="bg-orange-50 text-orange-500"
              icon={ClipboardList}
              label="Total Pesanan"
              value={String(dashboard.totalOrders)}
            />
            <SellerMetricCard
              accentClassName="bg-purple-50 text-purple-500"
              icon={PackageCheck}
              label="Produk Terjual"
              value={String(dashboard.totalProductsSold)}
            />
            <SellerMetricCard
              accentClassName="bg-yellow-50 text-amber-500"
              helperText={`${dashboard.reviewCount} ulasan`}
              icon={Star}
              label="Rating Toko"
              value={formatRating(dashboard.storeRating)}
            />
          </div>

          <TopSellingProductsCard products={dashboard.topSellingProducts} />
        </section>
      ) : null}
    </>
  )
}

type SellerDashboardNoticeProps = {
  actionLabel?: string
  actionTo?: '/seller/profile/edit-store'
  icon: LucideIcon
  message: string
  tone: 'info' | 'warning'
}

function SellerDashboardNotice({
  actionLabel,
  actionTo,
  icon: Icon,
  message,
  tone,
}: SellerDashboardNoticeProps) {
  return (
    <div
      className={[
        'rounded-lg border px-4 py-4',
        tone === 'warning'
          ? 'border-amber-200 bg-amber-50'
          : 'border-blue-200 bg-blue-50',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden="true"
          className={[
            'mt-0.5 size-5 shrink-0',
            tone === 'warning' ? 'text-amber-600' : 'text-[#1e40af]',
          ].join(' ')}
        />
        <div className="min-w-0 flex-1">
          <p
            className={[
              'text-sm leading-6',
              tone === 'warning' ? 'text-amber-900' : 'text-blue-900',
            ].join(' ')}
          >
            {message}
          </p>
          {actionLabel && actionTo ? (
            <Link
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#1e40af] px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c]"
              to={actionTo}
            >
              {actionLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
