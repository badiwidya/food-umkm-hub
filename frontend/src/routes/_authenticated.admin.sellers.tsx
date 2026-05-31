import { createFileRoute } from '@tanstack/react-router'

import { AdminSellersPage } from '../features/admin'

export const Route = createFileRoute('/_authenticated/admin/sellers')({
  component: AdminSellersPage,
})
