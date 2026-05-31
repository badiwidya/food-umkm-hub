import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatDateTime, formatRole } from '../components/admin-format'
import { AdminStatusBadge } from '../components/admin-status-badge'
import { ConfirmModal } from '../components/confirm-modal'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import {
  getAdminReportById,
  updateReportStatus,
} from '../services/admin-service'
import type { AdminReport, AdminReportStatus } from '../types'

type AdminReportDetailPageProps = {
  reportId: string
}

export function AdminReportDetailPage({
  reportId,
}: AdminReportDetailPageProps) {
  const reportQuery = useQuery({
    queryFn: () => getAdminReportById(reportId),
    queryKey: ['admin-reports', reportId],
  })

  const [report, setReport] = useState<AdminReport | null>(null)
  const [confirmStatus, setConfirmStatus] =
    useState<AdminReportStatus | null>(null)
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    if (reportQuery.data) {
      setReport(reportQuery.data)
      setAdminNote(reportQuery.data.adminNote ?? '')
    }
  }, [reportQuery.data])

  async function handleUpdateStatus(status: AdminReportStatus) {
    if (!report) return

    await updateReportStatus(report.id, status)

    setReport({
      ...report,
      adminNote,
      status,
      history: [
        ...report.history,
        {
          label: status === 'resolved' ? 'Selesai' : 'Status diperbarui',
          date: new Date().toISOString(),
          note: adminNote || undefined,
        },
      ],
    })
    setConfirmStatus(null)
  }

  if (reportQuery.isPending) {
    return <LoadingState />
  }

  if (reportQuery.isError || !report) {
    return (
      <>
        <PageHeader
          description="Data laporan tidak ditemukan atau gagal dimuat."
          title="Detail Laporan"
        />
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white"
          to="/admin/reports"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Laporan
        </Link>
      </>
    )
  }

  return (
    <>
      <PageHeader
        description="Tinjau kronologi, bukti, riwayat status, dan tindakan admin."
        title={`Detail Laporan ${report.id}`}
        action={<AdminStatusBadge status={report.status} />}
      />

      <Link
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#006B3F]"
        to="/admin/reports"
      >
        <ArrowLeft className="size-4" />
        Kembali
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Informasi Laporan
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Info label="Nama pelapor" value={report.reporterName} />
              <Info label="Role pelapor" value={formatRole(report.reporterRole)} />
              <Info label="Nama UMKM" value={report.storeName} />
              <Info label="Nomor pesanan" value={report.orderNumber} />
              <Info label="Kategori masalah" value={report.category} />
              <Info label="Tanggal laporan" value={formatDateTime(report.createdAt)} />
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-slate-700">
                Kronologi masalah
              </p>
              <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {report.chronology}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Bukti Laporan
            </h2>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {report.evidenceUrl ? (
                <img
                  alt={`Bukti laporan ${report.id}`}
                  className="max-h-80 w-full rounded-xl object-cover"
                  src={report.evidenceUrl}
                />
              ) : (
                <div className="flex h-44 items-center justify-center rounded-xl bg-white text-sm text-slate-400">
                  Belum ada bukti gambar
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Tindakan Admin
            </h2>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">
                Catatan admin
              </span>
              <textarea
                className="input-admin mt-2 min-h-28"
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Tambahkan catatan penanganan..."
                value={adminNote}
              />
            </label>

            <div className="mt-4 grid gap-2">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white hover:bg-[#004D2E]"
                onClick={() => setConfirmStatus('resolved')}
                type="button"
              >
                <CheckCircle2 className="size-4" />
                Tandai Selesai
              </button>

              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 hover:bg-red-100"
                onClick={() => setConfirmStatus('rejected')}
                type="button"
              >
                <XCircle className="size-4" />
                Tolak Laporan
              </button>

              <button
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setConfirmStatus('processing')}
                type="button"
              >
                Ubah ke Diproses
              </button>

              <button
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setConfirmStatus('waiting_response')}
                type="button"
              >
                Menunggu Respon
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Riwayat Status
            </h2>

            <div className="mt-4 space-y-4">
              {report.history.map((item, index) => (
                <div className="relative pl-6" key={`${item.label}-${index}`}>
                  <span className="absolute left-0 top-1.5 size-3 rounded-full bg-[#006B3F]" />
                  <p className="text-sm font-medium text-slate-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(item.date)}
                  </p>
                  {item.note ? (
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {item.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <ConfirmModal
        danger={confirmStatus === 'rejected'}
        description="Status laporan akan diperbarui sesuai tindakan admin."
        onCancel={() => setConfirmStatus(null)}
        onConfirm={() => {
          if (confirmStatus) {
            void handleUpdateStatus(confirmStatus)
          }
        }}
        open={Boolean(confirmStatus)}
        title="Konfirmasi tindakan"
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
