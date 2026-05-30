import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath, isRegisterRole } from '../features/auth'

export const Route = createFileRoute('/register/$role')({
  beforeLoad: ({ context, params }) => {
    const { accessToken, user } = context.auth.getState()

    if (user) {
      throw redirect({
        href: getRoleLandingPath(user.role),
        replace: true,
      })
    }

    if (accessToken) {
      throw redirect({
        to: '/',
        replace: true,
      })
    }

    if (!isRegisterRole(params.role)) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: RegisterRoute,
})

function RegisterRoute() {
  return <Outlet />
}
