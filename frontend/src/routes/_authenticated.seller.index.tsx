import { createFileRoute } from '@tanstack/react-router'

import { SellerDashboardPage } from '../features/seller'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/_authenticated/seller/')({
  head: () => titleHead('Dashboard Penjual'),
  component: SellerDashboardRoute,
})

function SellerDashboardRoute() {
  return <SellerDashboardPage />
}
