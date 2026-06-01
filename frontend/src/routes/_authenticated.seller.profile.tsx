import { createFileRoute } from '@tanstack/react-router'

import { SellerProfilePage } from '../features/seller'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/_authenticated/seller/profile')({
  head: () => titleHead('Profil Penjual'),
  component: SellerProfileRoute,
})

function SellerProfileRoute() {
  return <SellerProfilePage />
}
