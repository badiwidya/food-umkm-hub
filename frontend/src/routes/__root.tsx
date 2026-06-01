import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import type { RouterContext } from '../lib/router'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        title: 'Food & UMKM Hub',
      },
    ],
  }),
  component: RootRoute,
})

function RootRoute() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  )
}
