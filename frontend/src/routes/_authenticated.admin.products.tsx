import { createFileRoute } from '@tanstack/react-router'

import { AdminProductsPage } from '../features/admin'

export const Route = createFileRoute('/_authenticated/admin/products')({
  component: AdminProductsPage,
})
