import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Store,
  UserCheck,
} from 'lucide-react'

import { AdminDashboardCard } from '../components/admin-dashboard-card'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import { getAdminDashboard } from '../services/admin-service'

export function AdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryFn: getAdminDashboard,
    queryKey: ['admin-dashboard'],
  })

  if (dashboardQuery.isPending) {
    return (
      <>
        <PageHeader
          description="Monitoring laporan, verifikasi UMKM, dan status penjual."
          title="Dashboard Admin"
        />
        <LoadingState />
      </>
    )
  }

  if (dashboardQuery.isError) {
    return (
      <>
        <PageHeader
          description="Monitoring laporan, verifikasi UMKM, dan status penjual."
          title="Dashboard Admin"
        />
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          Dashboard admin gagal dimuat.
        </div>
      </>
    )
  }

  const data = dashboardQuery.data

  return (
    <>
      <PageHeader
        description="Fokus utama admin adalah menyelesaikan laporan, memverifikasi UMKM, dan memantau status penjual."
        title="Dashboard Admin"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminDashboardCard
          description="Semua laporan yang masuk dari pembeli dan penjual."
          icon={<AlertCircle className="size-5" />}
          title="Total Laporan Masuk"
          value={String(data.totalReports)}
        />
        <AdminDashboardCard
          description="Laporan baru yang belum mulai ditangani."
          icon={<Clock className="size-5" />}
          title="Belum Diproses"
          value={String(data.newReports)}
        />
        <AdminDashboardCard
          description="Laporan yang sedang ditangani admin."
          icon={<ShieldCheck className="size-5" />}
          title="Sedang Diproses"
          value={String(data.processingReports)}
        />
        <AdminDashboardCard
          description="Masalah yang sudah berhasil diselesaikan."
          icon={<CheckCircle2 className="size-5" />}
          title="Laporan Selesai"
          value={String(data.resolvedReports)}
        />
        <AdminDashboardCard
          description="UMKM yang sedang aktif di platform."
          icon={<Store className="size-5" />}
          title="UMKM Aktif"
          value={String(data.activeStores)}
        />
        <AdminDashboardCard
          description="UMKM yang sedang dinonaktifkan."
          icon={<Store className="size-5" />}
          title="UMKM Nonaktif"
          value={String(data.inactiveStores)}
        />
        <AdminDashboardCard
          description="UMKM yang masih menunggu verifikasi admin."
          icon={<ShieldCheck className="size-5" />}
          title="UMKM Pending"
          value={String(data.pendingStoreVerification)}
        />
        <AdminDashboardCard
          description="Akun penjual yang masih perlu diverifikasi."
          icon={<UserCheck className="size-5" />}
          title="Penjual Pending"
          value={String(data.pendingSellerVerification)}
        />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Catatan Dashboard
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Bagian ini tidak menggunakan istilah total transaksi penjualan.
          Fokusnya adalah laporan transaksi, verifikasi UMKM, status penjual,
          dan masalah yang berhasil diselesaikan.
        </p>
      </section>
    </>
  )
}
