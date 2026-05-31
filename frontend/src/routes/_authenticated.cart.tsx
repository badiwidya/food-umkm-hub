import { createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth'
import { CartPage } from '../features/student/cart/cart-page'

export const Route = createFileRoute('/_authenticated/cart')({
  beforeLoad: ({ context }) => {
    const { user } = context.auth.getState()

    if (user && user.role !== 'student') {
      throw redirect({
        to: getRoleLandingPath(user.role),
      })
    }
  },
  component: CartRoute,
})

function CartRoute() {
  return <CartPage />
}
