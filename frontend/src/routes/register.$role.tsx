import { createFileRoute, redirect } from '@tanstack/react-router'

import { RegisterAccountPage, isRegisterRole } from '../features/auth'

export const Route = createFileRoute('/register/$role')({
  beforeLoad: ({ params }) => {
    if (!isRegisterRole(params.role)) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: RegisterRoute,
})

function RegisterRoute() {
  const { role } = Route.useParams()

  if (!isRegisterRole(role)) {
    return null
  }

  return <RegisterAccountPage role={role} />
}
