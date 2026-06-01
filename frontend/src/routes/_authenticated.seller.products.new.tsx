import { createFileRoute } from '@tanstack/react-router'

import { AddProductPage } from '../features/seller'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/_authenticated/seller/products/new')({
  head: () => titleHead('Tambah Produk'),
  component: AddProductRoute,
})

function AddProductRoute() {
  return <AddProductPage />
}
