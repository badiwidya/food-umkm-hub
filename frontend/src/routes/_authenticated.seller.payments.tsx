import { createFileRoute } from '@tanstack/react-router'

import { SellerPaymentsPage } from '../features/seller'

export const Route = createFileRoute('/_authenticated/seller/payments')({
  component: SellerPaymentsPage,
})