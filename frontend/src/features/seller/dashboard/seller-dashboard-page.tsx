import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  ReceiptText,
  Wallet,
} from 'lucide-react'

import { formatRupiah } from '../components/format'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import { SellerDashboardCard } from '../components/seller-dashboard-card'
import { StatusBadge } from '../components/status-badge'
import { getSellerDashboard } from '../services/seller-service'

export function SellerDashboardPage() {
  const dashboardQuery = useQuery({
    queryFn: getSellerDashboard,
    queryKey: ['seller-dashboard'],
  })

  if (dashboardQuery.isPending) {
    return (
      <>
        <PageHeader
          description="Ringkasan performa toko dan pesanan hari ini."
          title="Dashboard Penjual"
        />
        <LoadingState />
      </>
    )
  }

  if (dashboardQuery.isError) {
    return (
      <>
        <PageHeader
          description="Ringkasan performa toko dan pesanan hari ini."
          title="Dashboard Penjual"
        />
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          Dashboard gagal dimuat.
        </div>
      </>
    )
  }

  const data = dashboardQuery.data
  const maxRevenue = Math.max(...data.dailyRevenue.map((item) => item.revenue))

  return (
    <>
      <PageHeader
        description="Ringkasan performa toko, pesanan, dan pendapatan."
        title="Dashboard Penjual"
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span
              className={[
                'size-2.5 rounded-full',
                data.store.isOpen ? 'bg-green-500' : 'bg-red-500',
              ].join(' ')}
            />
            <span className="text-sm font-medium text-slate-700">
              Toko {data.store.isOpen ? 'Buka' : 'Tutup'}
            </span>
            <StatusBadge status={data.store.verificationStatus} />
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SellerDashboardCard
          description="Jumlah pesanan masuk hari ini."
          icon={<ReceiptText className="size-5" />}
          title="Pesanan Hari Ini"
          value={String(data.totalOrdersToday)}
        />
        <SellerDashboardCard
          description="Pesanan yang sedang disiapkan."
          icon={<PackageCheck className="size-5" />}
          title="Diproses"
          value={String(data.processingOrders)}
        />
        <SellerDashboardCard
          description="Menunggu bukti pembayaran dicek."
          icon={<Clock className="size-5" />}
          title="Verifikasi"
          value={String(data.waitingVerification)}
        />
        <SellerDashboardCard
          description="Pesanan sudah selesai."
          icon={<CheckCircle2 className="size-5" />}
          title="Selesai"
          value={String(data.completedOrders)}
        />
        <SellerDashboardCard
          description="Estimasi omzet hari ini."
          icon={<Wallet className="size-5" />}
          title="Pendapatan"
          value={formatRupiah(data.revenueToday)}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Pendapatan Harian
            </h2>
            <p className="text-sm text-slate-500">
              Ringkasan pendapatan dan jumlah pesanan.
            </p>
          </div>

          <div className="space-y-4">
            {data.dailyRevenue.map((item) => (
              <div className="grid grid-cols-[40px_1fr_80px] items-center gap-3" key={item.day}>
                <p className="text-sm font-medium text-slate-600">{item.day}</p>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#006B3F]"
                    style={{
                      width: `${Math.max(10, (item.revenue / maxRevenue) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-right text-xs text-slate-500">
                  {item.orders} order
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Produk Terlaris
            </h2>
            <p className="text-sm text-slate-500">
              Produk dengan penjualan tertinggi.
            </p>
          </div>

          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"
                key={product.name}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#F4B400]/20 text-sm font-bold text-[#7A5A00]">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    {product.name}
                  </p>
                </div>
                <p className="text-sm text-slate-500">{product.sold} terjual</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}