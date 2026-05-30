const REGISTER_ROLES = ['student', 'seller'] as const

export type RegisterRole = (typeof REGISTER_ROLES)[number]

export function isRegisterRole(value: string): value is RegisterRole {
  return REGISTER_ROLES.includes(value as RegisterRole)
}
