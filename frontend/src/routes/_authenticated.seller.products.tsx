import { Outlet, createFileRoute } from '@tanstack/react-router'

import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/_authenticated/seller/products')({
  head: () => titleHead('Produk Penjual'),
  component: SellerProductsParentRoute,
})

function SellerProductsParentRoute() {
  return <Outlet />
}
