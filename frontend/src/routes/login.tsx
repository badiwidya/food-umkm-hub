import { createFileRoute, redirect } from '@tanstack/react-router'

import { LoginPage, getRoleLandingPath } from '../features/auth'
import { titleHead } from '../lib/page-title'

type LoginSearch = {
  redirect?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: ({ context }) => {
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
  },
  head: () => titleHead('Login'),
  component: LoginRoute,
})

function LoginRoute() {
  const { redirect } = Route.useSearch()

  return <LoginPage redirect={redirect} />
}
