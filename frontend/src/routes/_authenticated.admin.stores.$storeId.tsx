import { createFileRoute } from '@tanstack/react-router'

import type { StoreApprovalStatus } from '../client'
import { AdminApplicationsPage } from '../features/admin'
import { titleHead } from '../lib/page-title'

type AdminApplicationDetailSearch = {
  page: number
  status?: StoreApprovalStatus
}

export const Route = createFileRoute('/_authenticated/admin/stores/$storeId')({
  validateSearch: (search): AdminApplicationDetailSearch => ({
    page: parsePage(search.page),
    status: parseApplicationStatus(search.status),
  }),
  head: () => titleHead('Detail Aplikasi UMKM'),
  component: AdminApplicationDetailRoute,
})

function AdminApplicationDetailRoute() {
  const { storeId } = Route.useParams()
  const { page, status } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <AdminApplicationsPage
      onPageChange={(nextPage) => {
        void navigate({
          resetScroll: false,
          search: {
            page: nextPage,
            status,
          },
        })
      }}
      onStatusChange={(nextStatus) => {
        void navigate({
          resetScroll: false,
          search: {
            page: 1,
            status: nextStatus,
          },
        })
      }}
      page={page}
      selectedStoreId={storeId}
      status={status}
    />
  )
}

function parsePage(value: unknown) {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)

    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue
    }
  }

  return 1
}

function parseApplicationStatus(
  value: unknown,
): StoreApprovalStatus | undefined {
  if (value === 'pending' || value === 'approved' || value === 'rejected') {
    return value
  }

  return undefined
}
