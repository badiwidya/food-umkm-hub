import { createFileRoute, redirect } from '@tanstack/react-router'

import { CheckEmailPage, getRoleLandingPath } from '../features/auth'

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
  component: CheckEmailRoute,
})

function CheckEmailRoute() {
  const { email } = Route.useSearch()

  return <CheckEmailPage email={email} />
}
