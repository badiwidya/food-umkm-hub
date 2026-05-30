import { createRouter } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import { routeTree } from '../routeTree.gen'
import { getAuthState, type AuthState } from '../stores/auth-store'
import { queryClient } from './query-client'

type RouterAuthContext = {
  getState: () => AuthState
}

export type RouterContext = {
  auth: RouterAuthContext
  queryClient: QueryClient
}

export const router = createRouter({
  context: {
    auth: {
      getState: getAuthState,
    },
    queryClient,
  },
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
