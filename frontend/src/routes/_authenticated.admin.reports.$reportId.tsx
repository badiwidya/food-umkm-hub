import { createFileRoute } from '@tanstack/react-router'

import { AdminReportDetailPage } from '../features/admin'

export const Route = createFileRoute('/_authenticated/admin/reports/$reportId')({
  component: AdminReportDetailRoute,
})

function AdminReportDetailRoute() {
  const { reportId } = Route.useParams()

  return <AdminReportDetailPage reportId={reportId} />
}
