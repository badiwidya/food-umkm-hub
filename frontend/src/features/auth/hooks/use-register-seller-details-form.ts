import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { registerUmkmAuthSellerRegisterPostMutation } from '../../../client/@tanstack/react-query.gen'
import {
  getBackendErrorInfo,
  shouldReturnToRegisterAccountStep,
} from '../lib/backend-error'
import {
  clearRegistrationDraft,
  getRegistrationDraft,
} from '../lib/registration-draft'

const registerSellerDetailsFormSchema = z.object({
  address: z.string().min(1, 'Alamat toko wajib diisi.'),
  description: z.string().min(1, 'Deskripsi toko wajib diisi.'),
  mapsLink: z.string().optional(),
  name: z.string().min(1, 'Nama toko wajib diisi.'),
})

type RegisterSellerDetailsFormValues = z.infer<
  typeof registerSellerDetailsFormSchema
>

export function useRegisterSellerDetailsForm() {
  const navigate = useNavigate()
  const draft = useMemo(() => getRegistrationDraft('seller'), [])
  const [formError, setFormError] = useState<string | null>(
    draft ? null : 'Lengkapi data akun penjual terlebih dahulu.',
  )
  const form = useForm<RegisterSellerDetailsFormValues>({
    defaultValues: {
      address: '',
      description: '',
      mapsLink: '',
      name: '',
    },
  })
  const registerMutation = useMutation(
    registerUmkmAuthSellerRegisterPostMutation(),
  )

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    if (!draft) {
      setFormError('Lengkapi data akun penjual terlebih dahulu.')
      return
    }

    const parsedValues = registerSellerDetailsFormSchema.safeParse(values)

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (
          fieldName === 'address' ||
          fieldName === 'description' ||
          fieldName === 'mapsLink' ||
          fieldName === 'name'
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
      await registerMutation.mutateAsync({
        body: {
          email: draft.email,
          fullName: draft.fullName,
          password: draft.password,
          phoneNumber: draft.phoneNumber,
          store: {
            address: parsedValues.data.address,
            description: parsedValues.data.description,
            mapsLink: parsedValues.data.mapsLink || undefined,
            name: parsedValues.data.name,
          },
        },
      })
      clearRegistrationDraft()
      void navigate({
        search: { email: draft.email },
        to: '/register/check-email',
      })
    } catch (error) {
      const backendError = getBackendErrorInfo(error)

      if (shouldReturnToRegisterAccountStep(backendError?.type ?? null)) {
        void navigate({
          params: { role: 'seller' },
          search: {
            errorMessage:
              backendError?.message ??
              'Pendaftaran penjual gagal. Periksa kembali data akun Anda.',
          },
          to: '/register/$role',
        })
        return
      }

      setFormError(
        backendError?.message ??
          'Pendaftaran penjual gagal. Periksa kembali data Anda.',
      )
    }
  })

  return {
    form,
    formError,
    isPending: registerMutation.isPending,
    onSubmit,
  }
}
