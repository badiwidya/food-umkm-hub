import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth/lib/role-redirect'

export const Route = createFileRoute('/_authenticated/profile')({
  beforeLoad: ({ context }) => {
    const { user } = context.auth.getState()

    if (user && user.role !== 'student') {
      throw redirect({
        to: getRoleLandingPath(user.role),
      })
    }
  },
  component: ProfileRoute,
})

function ProfileRoute() {
  return <Outlet />
}
