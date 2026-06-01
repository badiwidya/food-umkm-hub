import { createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth/lib/role-redirect'
import { EditProfilePage } from '../features/student/profile'

export const Route = createFileRoute('/_authenticated/profile/edit')({
  beforeLoad: ({ context }) => {
    const { user } = context.auth.getState()

    if (user && user.role !== 'student') {
      throw redirect({
        to: getRoleLandingPath(user.role),
      })
    }
  },
  component: EditProfileRoute,
})

function EditProfileRoute() {
  return <EditProfilePage />
}
