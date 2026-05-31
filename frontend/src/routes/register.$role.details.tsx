import { createFileRoute, redirect } from '@tanstack/react-router'

import {
  RegisterSellerDetailsPage,
  RegisterStudentDetailsPage,
  isRegisterRole,
} from '../features/auth'

export const Route = createFileRoute('/register/$role/details')({
  beforeLoad: ({ params }) => {
    if (!isRegisterRole(params.role)) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: RegisterDetailsRoute,
})

function RegisterDetailsRoute() {
  const { role } = Route.useParams()

  if (role === 'student') {
    return <RegisterStudentDetailsPage />
  }

  if (role === 'seller') {
    return <RegisterSellerDetailsPage />
  }

  return null
}
