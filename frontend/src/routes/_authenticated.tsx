import {
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from '@tanstack/react-router'

import { StudentAppShell } from '../features/student/layout'

const STUDENT_TAB_PATHS = new Set(['/', '/stores', '/favorites', '/activity'])

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    const { accessToken } = context.auth.getState()

    if (!accessToken) {
      throw redirect({
        search: {
          redirect: location.href,
        },
        to: '/login',
      })
    }
  },
  component: AuthenticatedRoute,
})

function AuthenticatedRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (STUDENT_TAB_PATHS.has(pathname)) {
    return (
      <StudentAppShell>
        <Outlet />
      </StudentAppShell>
    )
  }

  return <Outlet />
}
