import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth/lib/role-redirect'
import { AdminLayout } from '../features/admin'

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
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
