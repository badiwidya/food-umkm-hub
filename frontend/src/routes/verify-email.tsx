import { createFileRoute } from '@tanstack/react-router'

import { VerifyEmailPage } from '../features/auth'

type VerifyEmailSearch = {
  token?: string
  tokenId?: string
}

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    tokenId: typeof search.tokenId === 'string' ? search.tokenId : undefined,
  }),
  component: VerifyEmailRoute,
})

function VerifyEmailRoute() {
  const { token, tokenId } = Route.useSearch()

  return <VerifyEmailPage token={token} tokenId={tokenId} />
}
