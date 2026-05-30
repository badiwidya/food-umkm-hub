import type { UserRole } from '../../../client'

const ROLE_LANDING_PATHS = {
  admin: '/admin',
  seller: '/seller',
  student: '/',
} satisfies Record<UserRole, string>

export function getRoleLandingPath(role: UserRole): string {
  return ROLE_LANDING_PATHS[role]
}

export function getSafeRedirectPath(
  redirect: string | undefined,
): string | null {
  if (!redirect) {
    return null
  }

  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    return null
  }

  return redirect
}
