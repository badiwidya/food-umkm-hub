import { createFileRoute } from '@tanstack/react-router'

import { SellerOrdersPage } from '../features/seller'

export const Route = createFileRoute('/_authenticated/seller/orders')({
  component: SellerOrdersPage,
})