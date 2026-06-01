import { createFileRoute, redirect } from '@tanstack/react-router'

import { CheckEmailPage, getRoleLandingPath } from '../features/auth'
import { titleHead } from '../lib/page-title'

type CheckEmailSearch = {
  email?: string
}

export const Route = createFileRoute('/register/check-email')({
  validateSearch: (search: Record<string, unknown>): CheckEmailSearch => ({
    email: typeof search.email === 'string' ? search.email : undefined,
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
  head: () => titleHead('Cek Email'),
  component: CheckEmailRoute,
})

function CheckEmailRoute() {
  const { email } = Route.useSearch()

  return <CheckEmailPage email={email} />
}
