import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { formatDateTime, formatRupiah } from '../components/admin-format'
import { AdminStatusBadge } from '../components/admin-status-badge'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import {
  getAdminProductsByStore,
  getAdminReportsByStore,
  getAdminStoreById,
} from '../services/admin-service'

type AdminStoreDetailPageProps = {
  storeId: string
}

export function AdminStoreDetailPage({ storeId }: AdminStoreDetailPageProps) {
  const storeQuery = useQuery({
    queryFn: () => getAdminStoreById(storeId),
    queryKey: ['admin-stores', storeId],
  })

  const productsQuery = useQuery({
    queryFn: () => getAdminProductsByStore(storeId),
    queryKey: ['admin-products', storeId],
  })

  const reportsQuery = useQuery({
    queryFn: () => getAdminReportsByStore(storeId),
    queryKey: ['admin-reports', 'store', storeId],
  })

  if (storeQuery.isPending) {
    return <LoadingState />
  }

  if (storeQuery.isError || !storeQuery.data) {
    return (
      <>
        <PageHeader
          description="Data UMKM tidak ditemukan."
          title="Detail UMKM"
        />
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white"
          to="/admin/stores"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
      </>
    )
  }

  const store = storeQuery.data
  const products = productsQuery.data ?? []
  const reports = reportsQuery.data ?? []

  return (
    <>
      <PageHeader
        description="Lihat profil UMKM, produk, lokasi, dan riwayat laporan."
        title={store.name}
        action={
          <div className="flex gap-2">
            <AdminStatusBadge status={store.activeStatus} />
            <AdminStatusBadge status={store.verificationStatus} />
          </div>
        }
      />

      <Link
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#006B3F]"
        to="/admin/stores"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Data UMKM
      </Link>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Profil UMKM
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Info label="Nama pemilik" value={store.ownerName} />
            <Info label="Email" value={store.ownerEmail} />
            <Info label="No HP" value={store.ownerPhone} />
            <Info label="Kategori" value={store.category} />
            <Info label="Lokasi" value={store.location} />
            <Info
              label="Jam operasional"
              value={`${store.openTime} - ${store.closeTime}`}
            />
            <Info label="Jumlah produk" value={`${store.productCount} produk`} />
            <Info label="Jumlah pesanan" value={`${store.orderCount} pesanan`} />
          </div>

          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {store.description}
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              className="h-11 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white hover:bg-[#004D2E]"
              type="button"
            >
              {store.activeStatus === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
            </button>

            <button
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              type="button"
            >
              Verifikasi / Tolak
            </button>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Produk UMKM
            </h2>

            <div className="mt-4 space-y-3">
              {products.map((product) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                  key={product.id}
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {product.category} • {formatRupiah(product.price)}
                    </p>
                  </div>
                  <AdminStatusBadge
                    status={product.isAvailable ? 'active' : 'inactive'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Riwayat Laporan Terkait
            </h2>

            <div className="mt-4 space-y-3">
              {reports.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Belum ada laporan terkait UMKM ini.
                </p>
              ) : (
                reports.map((report) => (
                  <Link
                    className="block rounded-xl bg-slate-50 p-3 hover:bg-slate-100"
                    key={report.id}
                    params={{ reportId: report.id }}
                    to="/admin/reports/$reportId"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">
                        {report.id}
                      </p>
                      <AdminStatusBadge status={report.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {report.category} • {formatDateTime(report.createdAt)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
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
