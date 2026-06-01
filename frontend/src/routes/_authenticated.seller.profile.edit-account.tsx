import { createFileRoute } from '@tanstack/react-router'

import { EditSellerAccountProfilePage } from '../features/seller'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute(
  '/_authenticated/seller/profile/edit-account',
)({
  head: () => titleHead('Edit Akun Penjual'),
  component: EditSellerAccountProfileRoute,
})

function EditSellerAccountProfileRoute() {
  return <EditSellerAccountProfilePage />
}
