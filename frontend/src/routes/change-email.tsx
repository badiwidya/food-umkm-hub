import { createFileRoute } from '@tanstack/react-router'

import { ChangeEmailPage } from '../features/auth'

type ChangeEmailSearch = {
  token?: string
  tokenId?: string
}

export const Route = createFileRoute('/change-email')({
  validateSearch: (search: Record<string, unknown>): ChangeEmailSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    tokenId: typeof search.tokenId === 'string' ? search.tokenId : undefined,
  }),
  component: ChangeEmailRoute,
})

function ChangeEmailRoute() {
  const { token, tokenId } = Route.useSearch()

  return <ChangeEmailPage token={token} tokenId={tokenId} />
}
