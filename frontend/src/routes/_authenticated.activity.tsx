import { createFileRoute } from '@tanstack/react-router'

import { ActivityPage } from '../features/student/activity/activity-page'
import { parseActivityStatus } from '../features/student/activity/activity-status'

export const Route = createFileRoute('/_authenticated/activity')({
  validateSearch: (search) => ({
    status: parseActivityStatus(search.status),
  }),
  component: ActivityRoute,
})

function ActivityRoute() {
  const { status } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <ActivityPage
      onStatusChange={(nextStatus) => {
        void navigate({
          search: {
            status: nextStatus,
          },
        })
      }}
      status={status}
    />
  )
}
