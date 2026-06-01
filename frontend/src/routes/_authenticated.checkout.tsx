import { createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth'
import {
  CheckoutPage,
  type CheckoutSearch,
} from '../features/student/checkout/checkout-page'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/_authenticated/checkout')({
  validateSearch: (search): CheckoutSearch => ({
    note: typeof search.note === 'string' ? search.note : undefined,
    productId:
      typeof search.productId === 'string' ? search.productId : undefined,
    quantity:
      typeof search.quantity === 'number'
        ? Math.max(1, Math.floor(search.quantity))
        : typeof search.quantity === 'string'
          ? Math.max(1, Number.parseInt(search.quantity, 10) || 1)
          : undefined,
    returnTo:
      search.returnTo === 'cart' || search.returnTo === 'product'
        ? search.returnTo
        : undefined,
  }),
  beforeLoad: ({ context }) => {
    const { user } = context.auth.getState()

    if (user && user.role !== 'student') {
      throw redirect({
        to: getRoleLandingPath(user.role),
      })
    }
  },
  head: () => titleHead('Checkout'),
  component: CheckoutRoute,
})

function CheckoutRoute() {
  const search = Route.useSearch()

  return <CheckoutPage search={search} />
}
