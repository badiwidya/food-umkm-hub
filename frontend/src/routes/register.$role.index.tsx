import { createFileRoute } from '@tanstack/react-router'

import { RegisterAccountPage, isRegisterRole } from '../features/auth'

export const Route = createFileRoute('/register/$role/')({
  component: RegisterIndexRoute,
})

function RegisterIndexRoute() {
  const { role } = Route.useParams()

  if (!isRegisterRole(role)) {
    return null
  }

  return <RegisterAccountPage role={role} />
}
