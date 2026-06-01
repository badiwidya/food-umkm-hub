import { createFileRoute } from '@tanstack/react-router'

import { ChangeEmailSuccessPage } from '../features/auth'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/change-email/success')({
  head: () => titleHead('Email Berhasil Diubah'),
  component: ChangeEmailSuccessRoute,
})

function ChangeEmailSuccessRoute() {
  return <ChangeEmailSuccessPage />
}
