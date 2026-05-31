import { Link } from '@tanstack/react-router'
import { Eye } from 'lucide-react'

import { formatDateTime, formatRole } from '../components/admin-format'
import { AdminStatusBadge } from '../components/admin-status-badge'
import type { AdminReport } from '../types'

type ReportTableProps = {
  reports: AdminReport[]
}

export function ReportTable({ reports }: ReportTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                'ID',
                'Pelapor',
                'UMKM',
                'Pesanan',
                'Kategori',
                'Status',
                'Prioritas',
                'Tanggal',
                'Aksi',
              ].map((heading) => (
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  key={heading}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {reports.map((report) => (
              <tr className="hover:bg-slate-50" key={report.id}>
                <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                  {report.id}
                </td>
                <td className="px-4 py-4 text-sm">
                  <p className="font-medium text-slate-900">
                    {report.reporterName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatRole(report.reporterRole)}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {report.storeName}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {report.orderNumber}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {report.category}
                </td>
                <td className="px-4 py-4">
                  <AdminStatusBadge status={report.status} />
                </td>
                <td className="px-4 py-4">
                  <AdminStatusBadge status={report.priority} />
                </td>
                <td className="px-4 py-4 text-sm text-slate-500">
                  {formatDateTime(report.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <Link
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#006B3F] px-3 text-sm font-medium text-white hover:bg-[#004D2E]"
                    params={{ reportId: report.id }}
                    to="/admin/reports/$reportId"
                  >
                    <Eye className="size-4" />
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {reports.map((report) => (
          <article className="p-4" key={report.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{report.id}</p>
                <p className="text-sm text-slate-500">
                  {report.reporterName} • {formatRole(report.reporterRole)}
                </p>
              </div>
              <AdminStatusBadge status={report.status} />
            </div>

            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>UMKM: {report.storeName}</p>
              <p>Pesanan: {report.orderNumber}</p>
              <p>Kategori: {report.category}</p>
              <p>Tanggal: {formatDateTime(report.createdAt)}</p>
            </div>

            <Link
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#006B3F] text-sm font-medium text-white hover:bg-[#004D2E]"
              params={{ reportId: report.id }}
              to="/admin/reports/$reportId"
            >
              Lihat Detail
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
