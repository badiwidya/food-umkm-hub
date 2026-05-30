import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

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
  return <Outlet />
}
