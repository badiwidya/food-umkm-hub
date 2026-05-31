import { createFileRoute } from '@tanstack/react-router'

import { SellerProductsPage } from '../features/seller'

export const Route = createFileRoute('/_authenticated/seller/products')({
  component: SellerProductsPage,
})