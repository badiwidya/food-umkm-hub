import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { changePasswordUsersMePasswordPostMutation } from '../../../client/@tanstack/react-query.gen'
import { getBackendErrorMessage } from '../../auth/lib/backend-error'

const sellerChangePasswordFormSchema = z
  .object({
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi.'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Konfirmasi password tidak sama.',
    path: ['confirmPassword'],
  })

type SellerChangePasswordFormValues = z.infer<
  typeof sellerChangePasswordFormSchema
>

type UseSellerChangePasswordFormResult = {
  form: ReturnType<typeof useForm<SellerChangePasswordFormValues>>
  formError: string | null
  isPending: boolean
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>
}

export function useSellerChangePasswordForm(): UseSellerChangePasswordFormResult {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<SellerChangePasswordFormValues>({
    defaultValues: {
      confirmPassword: '',
      currentPassword: '',
      newPassword: '',
    },
  })
  const changePasswordMutation = useMutation(
    changePasswordUsersMePasswordPostMutation(),
  )

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    const parsedValues = sellerChangePasswordFormSchema.safeParse(values)

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (
          fieldName === 'confirmPassword' ||
          fieldName === 'currentPassword' ||
          fieldName === 'newPassword'
        ) {
          form.setError(fieldName, {
            message: issue.message,
            type: 'validate',
          })
        }
      }

      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        body: {
          newPassword: parsedValues.data.newPassword,
          oldPassword: parsedValues.data.currentPassword,
        },
      })
      form.reset()
      await navigate({ to: '/seller/profile' })
    } catch (error) {
      setFormError(
        getBackendErrorMessage(
          error,
          'Password gagal diubah. Periksa password saat ini.',
        ),
      )
    }
  })

  return {
    form,
    formError,
    isPending: changePasswordMutation.isPending,
    onSubmit,
  }
}
