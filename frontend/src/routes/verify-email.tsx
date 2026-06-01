import { createFileRoute, redirect } from '@tanstack/react-router'

import { VerifyEmailPage, getRoleLandingPath } from '../features/auth'
import { titleHead } from '../lib/page-title'

type VerifyEmailSearch = {
  token?: string
  tokenId?: string
}

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    tokenId: typeof search.tokenId === 'string' ? search.tokenId : undefined,
  }),
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
  head: () => titleHead('Verifikasi Email'),
  component: VerifyEmailRoute,
})

function VerifyEmailRoute() {
  const { token, tokenId } = Route.useSearch()

  return <VerifyEmailPage token={token} tokenId={tokenId} />
}
