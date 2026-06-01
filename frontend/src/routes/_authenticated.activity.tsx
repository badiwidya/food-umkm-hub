import { createFileRoute } from '@tanstack/react-router'

import { ActivityPage } from '../features/student/activity/activity-page'
import { parseActivityStatus } from '../features/student/activity/activity-status'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/_authenticated/activity')({
  validateSearch: (search) => ({
    status: parseActivityStatus(search.status),
  }),
  head: () => titleHead('Aktivitas'),
  component: ActivityRoute,
})

function ActivityRoute() {
  const { status } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <ActivityPage
      onStatusChange={(nextStatus) => {
        void navigate({
          resetScroll: false,
          search: {
            status: nextStatus,
          },
        })
      }}
      status={status}
    />
  )
}
