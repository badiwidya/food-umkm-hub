import { useQuery } from '@tanstack/react-query'
import { ClipboardList, PackageCheck, Star, Wallet } from 'lucide-react'

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
        store={storeQuery.data}
      />

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
