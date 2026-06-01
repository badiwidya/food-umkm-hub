import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AdminAppShell } from '../features/admin'
import { getRoleLandingPath } from '../features/auth'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context }) => {
    const { user } = context.auth.getState()

    if (user && user.role !== 'admin') {
      throw redirect({
        to: getRoleLandingPath(user.role),
      })
    }
  },
  component: AdminRoute,
})

function AdminRoute() {
  return (
    <AdminAppShell>
      <Outlet />
    </AdminAppShell>
  )
}
