import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import type { RouterContext } from '../lib/router'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
})

function RootRoute() {
  return <Outlet />
}
