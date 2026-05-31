import { createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth'
import { CartPage } from '../features/student/cart/cart-page'

type CartSearch = {
  storeId?: string
}

export const Route = createFileRoute('/_authenticated/cart')({
  validateSearch: (search): CartSearch => ({
    storeId: typeof search.storeId === 'string' ? search.storeId : undefined,
  }),
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
  const { storeId } = Route.useSearch()

  return <CartPage searchStoreId={storeId} />
}
