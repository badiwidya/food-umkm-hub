import { createFileRoute } from '@tanstack/react-router'

import { EditStoreProfilePage } from '../features/seller'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute(
  '/_authenticated/seller/profile/edit-store',
)({
  head: () => titleHead('Edit Profil Toko'),
  component: EditStoreProfileRoute,
})

function EditStoreProfileRoute() {
  return <EditStoreProfilePage />
}
