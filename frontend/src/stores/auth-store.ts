import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { UserDetailResponse } from '../client'

type AuthState = {
  accessToken: string | null
  user: UserDetailResponse | null
}

type AuthActions = {
  setAuth: (auth: AuthState) => void
  clearAuth: () => void
}

type AuthStore = AuthState & AuthActions

const initialAuthState: AuthState = {
  accessToken: null,
  user: null,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialAuthState,
      setAuth: (auth) => set(auth),
      clearAuth: () => set(initialAuthState),
    }),
    {
      name: 'food-umkm-hub-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
)

export function getAuthState(): AuthState {
  const { accessToken, user } = useAuthStore.getState()

  return { accessToken, user }
}
