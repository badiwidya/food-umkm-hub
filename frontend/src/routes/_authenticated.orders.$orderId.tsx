import { createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth'
import { OrderDetailPage } from '../features/student/orders/order-detail-page'

export const Route = createFileRoute('/_authenticated/orders/$orderId')({
  beforeLoad: ({ context }) => {
    const { user } = context.auth.getState()

    if (user && user.role !== 'student') {
      throw redirect({
        to: getRoleLandingPath(user.role),
      })
    }
  },
  component: OrderDetailRoute,
})

function OrderDetailRoute() {
  const { orderId } = Route.useParams()

  return <OrderDetailPage orderId={orderId} />
}
