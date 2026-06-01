import { createFileRoute } from '@tanstack/react-router'

import { AddPromoPage } from '../features/seller'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/_authenticated/seller/promos/new')({
  head: () => titleHead('Tambah Promo'),
  component: AddPromoRoute,
})

function AddPromoRoute() {
  return <AddPromoPage />
}
