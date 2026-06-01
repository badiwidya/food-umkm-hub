import { createFileRoute } from '@tanstack/react-router'

import { SellerProfilePage } from '../features/seller'
import { titleHead } from '../lib/page-title'

type SellerProfileSearch = {
  emailChangeRequested?: boolean
}

export const Route = createFileRoute('/_authenticated/seller/profile/')({
  validateSearch: (search: Record<string, unknown>): SellerProfileSearch => ({
    emailChangeRequested: search.emailChangeRequested === true,
  }),
  head: () => titleHead('Profil Penjual'),
  component: SellerProfileIndexRoute,
})

function SellerProfileIndexRoute() {
  const { emailChangeRequested } = Route.useSearch()

  return (
    <SellerProfilePage showEmailChangeNotice={emailChangeRequested === true} />
  )
}
