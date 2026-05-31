import { createFileRoute } from '@tanstack/react-router'

import { ChangeEmailSuccessPage } from '../features/auth'

export const Route = createFileRoute('/change-email/success')({
  component: ChangeEmailSuccessRoute,
})

function ChangeEmailSuccessRoute() {
  return <ChangeEmailSuccessPage />
}
