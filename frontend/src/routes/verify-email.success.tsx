import { createFileRoute, redirect } from '@tanstack/react-router'

import { VerifyEmailSuccessPage, getRoleLandingPath } from '../features/auth'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/verify-email/success')({
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
  head: () => titleHead('Email Terverifikasi'),
  component: VerifyEmailSuccessRoute,
})

function VerifyEmailSuccessRoute() {
  return <VerifyEmailSuccessPage />
}
