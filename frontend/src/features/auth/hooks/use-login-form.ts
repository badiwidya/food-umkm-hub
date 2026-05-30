import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getMeUsersMeGet } from '../../../client'
import { loginAuthLoginPostMutation } from '../../../client/@tanstack/react-query.gen'
import { useAuthStore } from '../../../stores/auth-store'
import { getRoleLandingPath, getSafeRedirectPath } from '../lib/role-redirect'

const loginFormSchema = z.object({
  email: z.email('Masukkan email yang valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

type UseLoginFormOptions = {
  redirect?: string
}

export function useLoginForm({ redirect }: UseLoginFormOptions) {
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const loginMutation = useMutation(loginAuthLoginPostMutation())

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    const parsedValues = loginFormSchema.safeParse(values)

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (fieldName === 'email' || fieldName === 'password') {
          form.setError(fieldName, {
            message: issue.message,
            type: 'validate',
          })
        }
      }

      return
    }

    try {
      const loginResponse = await loginMutation.mutateAsync({
        body: parsedValues.data,
      })
      const { data: user } = await getMeUsersMeGet({
        auth: loginResponse.accessToken,
        throwOnError: true,
      })

      setAuth({
        accessToken: loginResponse.accessToken,
        user,
      })

      window.location.assign(
        getSafeRedirectPath(redirect) ?? getRoleLandingPath(user.role),
      )
    } catch {
      clearAuth()
      setFormError('Login gagal. Periksa email dan password Anda.')
    }
  })

  return {
    form,
    formError,
    isPending: loginMutation.isPending,
    onSubmit,
  }
}
