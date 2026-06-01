import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth'
import { SellerAppShell } from '../features/seller'

export const Route = createFileRoute('/_authenticated/seller')({
  beforeLoad: ({ context }) => {
    const { user } = context.auth.getState()

    if (user && user.role !== 'seller') {
      throw redirect({
        to: getRoleLandingPath(user.role),
      })
    }
  },
  component: SellerRoute,
})

function SellerRoute() {
  return (
    <SellerAppShell>
      <Outlet />
    </SellerAppShell>
  )
}
