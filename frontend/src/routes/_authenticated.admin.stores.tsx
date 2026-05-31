import { createFileRoute } from '@tanstack/react-router'

import { AdminStoresPage } from '../features/admin'

export const Route = createFileRoute('/_authenticated/admin/stores')({
  component: AdminStoresPage,
})
