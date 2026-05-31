import { createFileRoute } from '@tanstack/react-router'

import { SellerProfilePage } from '../features/seller'

export const Route = createFileRoute('/_authenticated/seller/profile')({
  component: SellerProfilePage,
})