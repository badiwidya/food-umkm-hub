import { Outlet, createFileRoute } from '@tanstack/react-router'

import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/_authenticated/seller/promos')({
  head: () => titleHead('Promo Penjual'),
  component: SellerPromosParentRoute,
})

function SellerPromosParentRoute() {
  return <Outlet />
}
