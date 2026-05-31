import { createFileRoute } from '@tanstack/react-router'

import { AdminDashboardPage } from '../features/admin'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminDashboardPage,
})
