import { createFileRoute } from '@tanstack/react-router'

import { AdminReportsPage } from '../features/admin'

export const Route = createFileRoute('/_authenticated/admin/reports')({
  component: AdminReportsPage,
})
