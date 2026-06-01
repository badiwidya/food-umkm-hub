import { createFileRoute } from '@tanstack/react-router'

import { SellerChangePasswordPage } from '../features/seller'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute(
  '/_authenticated/seller/profile/change-password',
)({
  head: () => titleHead('Ganti Password Penjual'),
  component: SellerChangePasswordRoute,
})

function SellerChangePasswordRoute() {
  return <SellerChangePasswordPage />
}
