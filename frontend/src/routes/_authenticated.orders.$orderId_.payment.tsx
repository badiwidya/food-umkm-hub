import { createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth'
import { QrisPaymentPage } from '../features/student/orders/qris-payment-page'

export const Route = createFileRoute(
  '/_authenticated/orders/$orderId_/payment',
)({
  beforeLoad: ({ context }) => {
    const { user } = context.auth.getState()

    if (user && user.role !== 'student') {
      throw redirect({
        to: getRoleLandingPath(user.role),
      })
    }
  },
  component: QrisPaymentRoute,
})

function QrisPaymentRoute() {
  const { orderId } = Route.useParams()

  return <QrisPaymentPage orderId={orderId} />
}
