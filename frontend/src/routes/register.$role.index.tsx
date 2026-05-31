import { createFileRoute } from '@tanstack/react-router'

import { RegisterAccountPage, isRegisterRole } from '../features/auth'

type RegisterIndexSearch = {
  errorMessage?: string
}

export const Route = createFileRoute('/register/$role/')({
  validateSearch: (search: Record<string, unknown>): RegisterIndexSearch => ({
    errorMessage:
      typeof search.errorMessage === 'string' ? search.errorMessage : undefined,
  }),
  component: RegisterIndexRoute,
})

function RegisterIndexRoute() {
  const { role } = Route.useParams()
  const { errorMessage } = Route.useSearch()

  if (!isRegisterRole(role)) {
    return null
  }

  return <RegisterAccountPage errorMessage={errorMessage} role={role} />
}
