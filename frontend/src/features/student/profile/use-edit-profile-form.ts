import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { StudentResponse, UserDetailResponse } from '../../../client'
import {
  changePhoneNumberUsersMePhonePostMutation,
  getMeStudentsMeGetOptions,
  requestEmailChangeUsersMeEmailPostMutation,
  updateStudentsMePatchMutation,
} from '../../../client/@tanstack/react-query.gen'
import { useAuthStore } from '../../../stores/auth-store'
import { getBackendErrorMessage } from '../../auth/lib/backend-error'
import { uploadAvatar, validateAvatarFile } from './avatar-upload'

const editProfileFormSchema = z.object({
  department: z.string().trim().min(1, 'Departemen wajib diisi.'),
  email: z.email('Masukkan email yang valid.'),
  faculty: z.string().trim().min(1, 'Fakultas wajib diisi.'),
  fullName: z.string().trim().min(1, 'Nama lengkap wajib diisi.'),
  nim: z.string().trim().min(1, 'NIM wajib diisi.'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+628\d{8,11}$/, 'Format nomor telepon harus +628xxxxxxxxxx.'),
})

export type EditProfileFormValues = z.infer<typeof editProfileFormSchema>

type UseEditProfileFormOptions = {
  student: StudentResponse
}

type SaveStepResult = {
  label: string
  status: 'fulfilled' | 'rejected'
}

export function useEditProfileForm({ student }: UseEditProfileFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const accessToken = useAuthStore((state) => state.accessToken)
  const authUser = useAuthStore((state) => state.user)

  const defaultValues = useMemo(
    () => ({
      department: student.department,
      email: student.email,
      faculty: student.faculty,
      fullName: student.fullName,
      nim: student.nim,
      phoneNumber: student.phoneNumber,
    }),
    [student],
  )

  const form = useForm<EditProfileFormValues>({
    defaultValues,
  })

  const updateStudentMutation = useMutation(updateStudentsMePatchMutation())
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

    const validationError = validateAvatarFile(file)

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

    const parsedValues = editProfileFormSchema.safeParse(values)

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (
          fieldName === 'department' ||
          fieldName === 'email' ||
          fieldName === 'faculty' ||
          fieldName === 'fullName' ||
          fieldName === 'nim' ||
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

    const nextValues = parsedValues.data
    let nextAvatarUrl = student.avatarUrl

    setIsSaving(true)

    if (avatarFile) {
      try {
        nextAvatarUrl = await uploadAvatar(avatarFile)
      } catch (error) {
        setAvatarError(
          getBackendErrorMessage(error, 'Foto profil gagal diunggah.'),
        )
        setIsSaving(false)
        return
      }
    }

    const shouldUpdateStudent =
      nextValues.fullName !== student.fullName ||
      nextValues.nim !== student.nim ||
      nextValues.faculty !== student.faculty ||
      nextValues.department !== student.department ||
      nextAvatarUrl !== student.avatarUrl
    const shouldUpdateEmail = nextValues.email !== student.email
    const shouldUpdatePhone = nextValues.phoneNumber !== student.phoneNumber

    if (!shouldUpdateStudent && !shouldUpdateEmail && !shouldUpdatePhone) {
      setFormSuccess('Tidak ada perubahan yang perlu disimpan.')
      setIsSaving(false)
      return
    }

    const authState = {
      accessToken,
      user: authUser,
    }
    const saveSteps: Array<Promise<SaveStepResult>> = []

    if (shouldUpdateStudent) {
      saveSteps.push(
        updateStudentMutation
          .mutateAsync({
            body: {
              avatarUrl: nextAvatarUrl,
              department: nextValues.department,
              faculty: nextValues.faculty,
              fullName: nextValues.fullName,
              nim: nextValues.nim,
            },
          })
          .then((updatedStudent) => {
            updateStoredUser(authState, setAuth, updatedStudent)

            return {
              label: 'Profil mahasiswa',
              status: 'fulfilled' as const,
            }
          })
          .catch(() => ({
            label: 'Profil mahasiswa',
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
            updateStoredUser(authState, setAuth, updatedUser)

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
      queryKey: getMeStudentsMeGetOptions().queryKey,
    })

    if (failedLabels.length > 0) {
      setFormError(`Gagal menyimpan: ${failedLabels.join(', ')}.`)
      setIsSaving(false)
      return
    }

    setIsSaving(false)
    void navigate({
      search: {
        emailChangeRequested: shouldUpdateEmail || undefined,
      },
      to: '/profile',
    })
  })

  return {
    avatarError,
    avatarPreviewUrl,
    form,
    formError,
    formSuccess,
    isPending:
      isSaving ||
      updateStudentMutation.isPending ||
      requestEmailChangeMutation.isPending ||
      changePhoneMutation.isPending,
    onSubmit,
    setAvatar,
  }
}

function updateStoredUser(
  authState: {
    accessToken: string | null
    user: UserDetailResponse | null
  },
  setAuth: (auth: {
    accessToken: string | null
    user: UserDetailResponse | null
  }) => void,
  user: UserDetailResponse,
) {
  if (!authState.accessToken || !authState.user) {
    return
  }

  setAuth({
    accessToken: authState.accessToken,
    user: {
      avatarUrl: user.avatarUrl,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      fullName: user.fullName,
      id: user.id,
      phoneNumber: user.phoneNumber,
      phoneVerifiedAt: user.phoneVerifiedAt,
      role: user.role,
      status: user.status,
    },
  })
}
