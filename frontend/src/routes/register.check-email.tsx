import { createFileRoute } from '@tanstack/react-router'

import { CheckEmailPage } from '../features/auth'

type CheckEmailSearch = {
  email?: string
}

export const Route = createFileRoute('/register/check-email')({
  validateSearch: (search: Record<string, unknown>): CheckEmailSearch => ({
    email: typeof search.email === 'string' ? search.email : undefined,
  }),
  component: CheckEmailRoute,
})

function CheckEmailRoute() {
  const { email } = Route.useSearch()

  return <CheckEmailPage email={email} />
}
