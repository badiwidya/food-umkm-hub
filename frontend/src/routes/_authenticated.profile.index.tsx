import { createFileRoute } from '@tanstack/react-router'

import { ProfilePage } from '../features/student/profile'
import { titleHead } from '../lib/page-title'

type ProfileSearch = {
  emailChangeRequested?: boolean
}

export const Route = createFileRoute('/_authenticated/profile/')({
  validateSearch: (search: Record<string, unknown>): ProfileSearch => ({
    emailChangeRequested: search.emailChangeRequested === true,
  }),
  head: () => titleHead('Profil'),
  component: ProfileIndexRoute,
})

function ProfileIndexRoute() {
  const { emailChangeRequested } = Route.useSearch()

  return <ProfilePage showEmailChangeNotice={emailChangeRequested === true} />
}
