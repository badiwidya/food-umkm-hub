import { createFileRoute } from '@tanstack/react-router'

import { ProfilePage } from '../features/student/profile'

type ProfileSearch = {
  emailChangeRequested?: boolean
}

export const Route = createFileRoute('/_authenticated/profile/')({
  validateSearch: (search: Record<string, unknown>): ProfileSearch => ({
    emailChangeRequested: search.emailChangeRequested === true,
  }),
  component: ProfileIndexRoute,
})

function ProfileIndexRoute() {
  const { emailChangeRequested } = Route.useSearch()

  return <ProfilePage showEmailChangeNotice={emailChangeRequested === true} />
}
