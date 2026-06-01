import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import type { BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { UpdateProfileRequest, UserDetailResponse } from '../../../client'
import {
  changePhoneNumberUsersMePhonePostMutation,
  getMeUsersMeGetOptions,
  requestEmailChangeUsersMeEmailPostMutation,
  updateCurrentProfileUsersMePatchMutation,
} from '../../../client/@tanstack/react-query.gen'
import { useAuthStore } from '../../../stores/auth-store'
import { getBackendErrorMessage } from '../../auth/lib/backend-error'
import {
  uploadSellerAvatar,
  validateSellerAvatarFile,
} from './profile-image-upload'

const editSellerAccountProfileFormSchema = z.object({
  email: z.email('Masukkan email yang valid.'),
  fullName: z.string().trim().min(1, 'Nama lengkap wajib diisi.'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+628\d{8,11}$/, 'Format nomor telepon harus +628xxxxxxxxxx.'),
})

export type EditSellerAccountProfileFormValues = z.infer<
  typeof editSellerAccountProfileFormSchema
>

type SaveStepResult = {
  label: string
  status: 'fulfilled' | 'rejected'
}

type UseEditSellerAccountProfileFormOptions = {
  account: UserDetailResponse
}

type UseEditSellerAccountProfileFormResult = {
  avatarError: string | null
  avatarFile: File | null
  avatarPreviewUrl: string | null
  form: ReturnType<typeof useForm<EditSellerAccountProfileFormValues>>
  formError: string | null
  formSuccess: string | null
  isPending: boolean
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>
  setAvatar: (file: File | null) => void
}

export function useEditSellerAccountProfileForm({
  account,
}: UseEditSellerAccountProfileFormOptions): UseEditSellerAccountProfileFormResult {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const accessToken = useAuthStore((state) => state.accessToken)

  const form = useForm<EditSellerAccountProfileFormValues>({
    defaultValues: {
      email: account.email,
      fullName: account.fullName,
      phoneNumber: account.phoneNumber,
    },
  })

  const updateProfileMutation = useMutation(
    updateCurrentProfileUsersMePatchMutation(),
  )
  const requestEmailChangeMutation = useMutation(
    requestEmailChangeUsersMeEmailPostMutation(),
  )
  const changePhoneMutation = useMutation(
    changePhoneNumberUsersMePhonePostMutation(),
  )

  const avatarPreviewUrl = useMemo(() => {
    if (!avatarFile) {
      return null
    }

    return URL.createObjectURL(avatarFile)
  }, [avatarFile])

  useEffect(() => {
    if (!avatarPreviewUrl) {
      return
    }

    return () => {
      URL.revokeObjectURL(avatarPreviewUrl)
    }
  }, [avatarPreviewUrl])

  function setAvatar(file: File | null) {
    setAvatarError(null)

    if (!file) {
      setAvatarFile(null)
      return
    }

    const validationError = validateSellerAvatarFile(file)

    if (validationError) {
      setAvatarError(validationError)
      setAvatarFile(null)
      return
    }

    setAvatarFile(file)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)
    setFormSuccess(null)

    const parsedValues = editSellerAccountProfileFormSchema.safeParse(values)

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (
          fieldName === 'email' ||
          fieldName === 'fullName' ||
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

    if (avatarError) {
      return
    }

    setIsSaving(true)

    let nextAvatarUrl = account.avatarUrl

    if (avatarFile) {
      try {
        nextAvatarUrl = await uploadSellerAvatar(avatarFile)
      } catch (error) {
        setAvatarError(
          getBackendErrorMessage(error, 'Foto profil gagal diunggah.'),
        )
        setIsSaving(false)
        return
      }
    }

    const nextValues = parsedValues.data
    const profileBody = toUpdateProfileRequest({
      account,
      avatarUrl: nextAvatarUrl,
      fullName: nextValues.fullName,
    })
    const shouldUpdateProfile = Object.keys(profileBody).length > 0
    const shouldUpdateEmail = nextValues.email !== account.email
    const shouldUpdatePhone = nextValues.phoneNumber !== account.phoneNumber

    if (!shouldUpdateProfile && !shouldUpdateEmail && !shouldUpdatePhone) {
      setFormSuccess('Tidak ada perubahan yang perlu disimpan.')
      setIsSaving(false)
      return
    }

    const saveSteps: Array<Promise<SaveStepResult>> = []

    if (shouldUpdateProfile) {
      saveSteps.push(
        updateProfileMutation
          .mutateAsync({
            body: profileBody,
          })
          .then((updatedUser) => {
            updateStoredUser(accessToken, setAuth, updatedUser)

            return {
              label: 'Profil akun',
              status: 'fulfilled' as const,
            }
          })
          .catch(() => ({
            label: 'Profil akun',
            status: 'rejected',
          })),
      )
    }

    if (shouldUpdateEmail) {
      saveSteps.push(
        requestEmailChangeMutation
          .mutateAsync({
            body: {
              email: nextValues.email,
            },
          })
          .then(() => ({
            label: 'Email',
            status: 'fulfilled' as const,
          }))
          .catch(() => ({
            label: 'Email',
            status: 'rejected',
          })),
      )
    }

    if (shouldUpdatePhone) {
      saveSteps.push(
        changePhoneMutation
          .mutateAsync({
            body: {
              phoneNumber: nextValues.phoneNumber,
            },
          })
          .then((updatedUser) => {
            updateStoredUser(accessToken, setAuth, updatedUser)

            return {
              label: 'Nomor telepon',
              status: 'fulfilled' as const,
            }
          })
          .catch(() => ({
            label: 'Nomor telepon',
            status: 'rejected',
          })),
      )
    }

    const results = await Promise.all(saveSteps)
    const failedLabels = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.label)

    await queryClient.invalidateQueries({
      queryKey: getMeUsersMeGetOptions().queryKey,
    })

    if (failedLabels.length > 0) {
      setFormError(`Gagal menyimpan: ${failedLabels.join(', ')}.`)
      setIsSaving(false)
      return
    }

    setIsSaving(false)
    await navigate({
      search: {
        emailChangeRequested: shouldUpdateEmail || undefined,
      },
      to: '/seller/profile',
    })
  })

  return {
    avatarError,
    avatarFile,
    avatarPreviewUrl,
    form,
    formError,
    formSuccess,
    isPending:
      isSaving ||
      updateProfileMutation.isPending ||
      requestEmailChangeMutation.isPending ||
      changePhoneMutation.isPending,
    onSubmit,
    setAvatar,
  }
}

function toUpdateProfileRequest(values: {
  account: UserDetailResponse
  avatarUrl: string | null
  fullName: string
}): UpdateProfileRequest {
  const requestBody: UpdateProfileRequest = {}

  if (values.fullName !== values.account.fullName) {
    requestBody.fullName = values.fullName
  }

  if (values.avatarUrl !== values.account.avatarUrl) {
    requestBody.avatarUrl = values.avatarUrl
  }

  return requestBody
}

function updateStoredUser(
  accessToken: string | null,
  setAuth: (auth: {
    accessToken: string | null
    user: UserDetailResponse | null
  }) => void,
  user: UserDetailResponse,
) {
  if (!accessToken) {
    return
  }

  setAuth({
    accessToken,
    user,
  })
}
