import { createFileRoute } from '@tanstack/react-router'

import { AdminStoreDetailPage } from '../features/admin'

export const Route = createFileRoute('/_authenticated/admin/stores/$storeId')({
  component: AdminStoreDetailRoute,
})

function AdminStoreDetailRoute() {
  const { storeId } = Route.useParams()

  return <AdminStoreDetailPage storeId={storeId} />
}
