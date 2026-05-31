import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { RegisterRole } from '../lib/register-role'
import {
  getRegistrationDraft,
  saveRegistrationDraft,
} from '../lib/registration-draft'

const registerAccountFormSchema = z
  .object({
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
    email: z.email('Masukkan email yang valid.'),
    fullName: z.string().min(1, 'Nama lengkap wajib diisi.'),
    password: z.string().min(8, 'Password minimal 8 karakter.'),
    phoneNumber: z.string().min(1, 'Nomor telepon wajib diisi.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Konfirmasi password harus sama.',
    path: ['confirmPassword'],
  })

type RegisterAccountFormValues = z.infer<typeof registerAccountFormSchema>

type UseRegisterAccountFormOptions = {
  role: RegisterRole
}

export function useRegisterAccountForm({
  role,
}: UseRegisterAccountFormOptions) {
  const navigate = useNavigate()
  const draft = useMemo(() => getRegistrationDraft(role), [role])
  const form = useForm<RegisterAccountFormValues>({
    defaultValues: {
      confirmPassword: draft?.password ?? '',
      email: draft?.email ?? '',
      fullName: draft?.fullName ?? '',
      password: draft?.password ?? '',
      phoneNumber: draft?.phoneNumber ?? '',
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    const parsedValues = registerAccountFormSchema.safeParse(values)

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (
          fieldName === 'confirmPassword' ||
          fieldName === 'email' ||
          fieldName === 'fullName' ||
          fieldName === 'password' ||
          fieldName === 'phoneNumber'
        ) {
          form.setError(fieldName, {
            message: issue.message,
            type: 'validate',
          })
        }
      }

      return
    }

    saveRegistrationDraft({
      email: parsedValues.data.email,
      fullName: parsedValues.data.fullName,
      password: parsedValues.data.password,
      phoneNumber: parsedValues.data.phoneNumber,
      role,
    })

    void navigate({
      params: { role },
      to: '/register/$role/details',
    })
  })

  return {
    form,
    onSubmit,
  }
}
