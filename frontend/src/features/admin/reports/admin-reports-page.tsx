import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState } from '../components/empty-state'
import { FilterTabs } from '../components/filter-tabs'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import { SearchInput } from '../components/search-input'
import { getAdminReports } from '../services/admin-service'
import type { AdminReportStatus } from '../types'
import { ReportTable } from './report-table'

type ReportFilter = 'all' | AdminReportStatus

const tabs: {
  label: string
  value: ReportFilter
}[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Baru', value: 'new' },
  { label: 'Diproses', value: 'processing' },
  { label: 'Menunggu Respon', value: 'waiting_response' },
  { label: 'Selesai', value: 'resolved' },
  { label: 'Ditolak', value: 'rejected' },
]

export function AdminReportsPage() {
  const reportsQuery = useQuery({
    queryFn: getAdminReports,
    queryKey: ['admin-reports'],
  })

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<ReportFilter>('all')

  const filteredReports = useMemo(() => {
    const reports = reportsQuery.data ?? []

    return reports.filter((report) => {
      const matchStatus = activeTab === 'all' || report.status === activeTab
      const keyword = search.toLowerCase()
      const matchSearch =
        report.id.toLowerCase().includes(keyword) ||
        report.reporterName.toLowerCase().includes(keyword) ||
        report.storeName.toLowerCase().includes(keyword) ||
        report.orderNumber.toLowerCase().includes(keyword) ||
        report.category.toLowerCase().includes(keyword)

      return matchStatus && matchSearch
    })
  }, [activeTab, reportsQuery.data, search])

  return (
    <>
      <PageHeader
        description="Kelola laporan masalah dari pembeli dan penjual."
        title="Laporan Transaksi"
      />

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <SearchInput
          onChange={setSearch}
          placeholder="Cari laporan, UMKM, pelapor, atau nomor pesanan..."
          value={search}
        />
        <FilterTabs
          activeValue={activeTab}
          onChange={setActiveTab}
          tabs={tabs}
        />
      </div>

      {reportsQuery.isPending ? <LoadingState /> : null}

      {reportsQuery.isError ? (
        <EmptyState
          description="Terjadi kesalahan saat memuat laporan."
          icon={<ClipboardList className="size-6" />}
          title="Laporan gagal dimuat"
        />
      ) : null}

      {reportsQuery.isSuccess && filteredReports.length === 0 ? (
        <EmptyState
          description="Tidak ada laporan yang sesuai dengan filter saat ini."
          icon={<ClipboardList className="size-6" />}
          title="Laporan kosong"
        />
      ) : null}

      {filteredReports.length > 0 ? (
        <ReportTable reports={filteredReports} />
      ) : null}
    </>
  )
}
