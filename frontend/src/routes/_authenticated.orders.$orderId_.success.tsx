import { createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth'
import { OrderSuccessPage } from '../features/student/orders/order-success-page'
import { getShortId, titleHead } from '../lib/page-title'

export const Route = createFileRoute(
  '/_authenticated/orders/$orderId_/success',
)({
  beforeLoad: ({ context }) => {
    const { user } = context.auth.getState()

    if (user && user.role !== 'student') {
      throw redirect({
        to: getRoleLandingPath(user.role),
      })
    }
  },
  head: ({ params }) => titleHead(`Pesanan #${getShortId(params.orderId)}`),
  component: OrderSuccessRoute,
})

function OrderSuccessRoute() {
  const { orderId } = Route.useParams()

  return <OrderSuccessPage orderId={orderId} />
}
