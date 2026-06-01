import { createFileRoute, redirect } from '@tanstack/react-router'

import { getRoleLandingPath } from '../features/auth/lib/role-redirect'
import { ChangePasswordPage } from '../features/student/profile'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/_authenticated/profile/change-password')(
  {
    beforeLoad: ({ context }) => {
      const { user } = context.auth.getState()

      if (user && user.role !== 'student') {
        throw redirect({
          to: getRoleLandingPath(user.role),
        })
      }
    },
    head: () => titleHead('Ganti Password'),
    component: ChangePasswordRoute,
  },
)

function ChangePasswordRoute() {
  return <ChangePasswordPage />
}
