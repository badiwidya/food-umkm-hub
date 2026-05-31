import { createFileRoute } from '@tanstack/react-router'

import { AdminVerificationPage } from '../features/admin'

export const Route = createFileRoute('/_authenticated/admin/verification')({
  component: AdminVerificationPage,
})
