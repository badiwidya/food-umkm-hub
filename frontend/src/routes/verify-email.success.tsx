import { createFileRoute } from '@tanstack/react-router'

import { VerifyEmailSuccessPage } from '../features/auth'

export const Route = createFileRoute('/verify-email/success')({
  component: VerifyEmailSuccessRoute,
})

function VerifyEmailSuccessRoute() {
  return <VerifyEmailSuccessPage />
}
