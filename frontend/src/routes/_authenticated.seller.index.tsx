import { createFileRoute } from '@tanstack/react-router'

import { SellerDashboardPage } from '../features/seller'

export const Route = createFileRoute('/_authenticated/seller/')({
  component: SellerDashboardPage,
})