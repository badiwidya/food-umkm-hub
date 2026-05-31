import { z } from 'zod'

import type { RegisterRole } from './register-role'

const REGISTRATION_DRAFT_KEY = 'food-umkm-hub-registration-draft'

const registrationDraftSchema = z.object({
  email: z.email(),
  fullName: z.string().min(1),
  password: z.string().min(8),
  phoneNumber: z.string().min(1),
  role: z.enum(['student', 'seller']),
})

export type RegistrationDraft = z.infer<typeof registrationDraftSchema>

export type RegistrationDraftInput = RegistrationDraft

function readStorageValue(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.sessionStorage.getItem(REGISTRATION_DRAFT_KEY)
}

export function getRegistrationDraft(
  role?: RegisterRole,
): RegistrationDraft | null {
  const storedValue = readStorageValue()

  if (!storedValue) {
    return null
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue)
    const draftResult = registrationDraftSchema.safeParse(parsedValue)

    if (!draftResult.success) {
      clearRegistrationDraft()
      return null
    }

    if (role && draftResult.data.role !== role) {
      clearRegistrationDraft()
      return null
    }

    return draftResult.data
  } catch {
    clearRegistrationDraft()
    return null
  }
}

export function saveRegistrationDraft(draft: RegistrationDraftInput): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(draft))
}

export function clearRegistrationDraft(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(REGISTRATION_DRAFT_KEY)
}
