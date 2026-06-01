import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import type { BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { StoreDetailResponse, UpdateStoreRequest } from '../../../client'
import {
  getDetailStoresIdGetOptions,
  getMeStoresMeGetOptions,
  getMyDashboardStoresMeDashboardGetOptions,
  listStoresGetQueryKey,
  patchMeStoresMePatchMutation,
} from '../../../client/@tanstack/react-query.gen'
import { getBackendErrorMessage } from '../../auth/lib/backend-error'
import {
  uploadQrisImage,
  uploadStorePhoto,
  validateQrisImageFile,
  validateStorePhotoFile,
} from './profile-image-upload'

const editStoreProfileFormSchema = z.object({
  address: z.string().trim().min(1, 'Alamat toko wajib diisi.'),
  description: z.string().trim().min(1, 'Deskripsi toko wajib diisi.'),
  mapsLink: z
    .string()
    .trim()
    .transform((value) => value || null),
  name: z.string().trim().min(1, 'Nama toko wajib diisi.'),
})

export type EditStoreProfileFormValues = z.input<
  typeof editStoreProfileFormSchema
>

type UseEditStoreProfileFormOptions = {
  store: StoreDetailResponse
}

type UseEditStoreProfileFormResult = {
  form: ReturnType<typeof useForm<EditStoreProfileFormValues>>
  formError: string | null
  formSuccess: string | null
  isPending: boolean
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>
  qrisError: string | null
  qrisFile: File | null
  qrisPreviewUrl: string | null
  setQrisImage: (file: File | null) => void
  setStorePhoto: (file: File | null) => void
  storePhotoError: string | null
  storePhotoFile: File | null
  storePhotoPreviewUrl: string | null
}

export function useEditStoreProfileForm({
  store,
}: UseEditStoreProfileFormOptions): UseEditStoreProfileFormResult {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [storePhotoFile, setStorePhotoFile] = useState<File | null>(null)
  const [qrisFile, setQrisFile] = useState<File | null>(null)
  const [storePhotoError, setStorePhotoError] = useState<string | null>(null)
  const [qrisError, setQrisError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const updateStoreMutation = useMutation(patchMeStoresMePatchMutation())

  const form = useForm<EditStoreProfileFormValues>({
    defaultValues: {
      address: store.address,
      description: store.description,
      mapsLink: store.mapsLink ?? '',
      name: store.name,
    },
  })

  const storePhotoPreviewUrl = useObjectUrl(storePhotoFile)
  const qrisPreviewUrl = useObjectUrl(qrisFile)

  function setStorePhoto(file: File | null) {
    setStorePhotoError(null)

    if (!file) {
      setStorePhotoFile(null)
      return
    }

    const validationError = validateStorePhotoFile(file)

    if (validationError) {
      setStorePhotoError(validationError)
      setStorePhotoFile(null)
      return
    }

    setStorePhotoFile(file)
  }

  function setQrisImage(file: File | null) {
    setQrisError(null)

    if (!file) {
      setQrisFile(null)
      return
    }

    const validationError = validateQrisImageFile(file)

    if (validationError) {
      setQrisError(validationError)
      setQrisFile(null)
      return
    }

    setQrisFile(file)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)
    setFormSuccess(null)

    const parsedValues = editStoreProfileFormSchema.safeParse(values)

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

    if (storePhotoError || qrisError) {
      return
    }

    setIsSaving(true)

    try {
      const nextPhotoUrl = storePhotoFile
        ? await uploadStorePhoto(storePhotoFile)
        : store.photoUrl
      const nextQrisImageUrl = qrisFile
        ? await uploadQrisImage(qrisFile)
        : store.qrisImageUrl
      const nextValues = parsedValues.data
      const requestBody = toUpdateStoreRequest({
        address: nextValues.address,
        description: nextValues.description,
        mapsLink: nextValues.mapsLink,
        name: nextValues.name,
        photoUrl: nextPhotoUrl,
        qrisImageUrl: nextQrisImageUrl,
        store,
      })

      if (Object.keys(requestBody).length === 0) {
        setFormSuccess('Tidak ada perubahan yang perlu disimpan.')
        setIsSaving(false)
        return
      }

      await updateStoreMutation.mutateAsync({
        body: requestBody,
      })

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getMeStoresMeGetOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getMyDashboardStoresMeDashboardGetOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getDetailStoresIdGetOptions({
            path: {
              id: store.id,
            },
          }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: listStoresGetQueryKey(),
        }),
      ])

      await navigate({ to: '/seller/profile' })
    } catch (error) {
      setFormError(
        getBackendErrorMessage(
          error,
          'Profil toko gagal diperbarui. Coba lagi.',
        ),
      )
      setIsSaving(false)
    }
  })

  return {
    form,
    formError,
    formSuccess,
    isPending: isSaving || updateStoreMutation.isPending,
    onSubmit,
    qrisError,
    qrisFile,
    qrisPreviewUrl,
    setQrisImage,
    setStorePhoto,
    storePhotoError,
    storePhotoFile,
    storePhotoPreviewUrl,
  }
}

function useObjectUrl(file: File | null) {
  const previewUrl = useMemo(() => {
    if (!file) {
      return null
    }

    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    if (!previewUrl) {
      return
    }

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return previewUrl
}

function toUpdateStoreRequest(values: {
  address: string
  description: string
  mapsLink: string | null
  name: string
  photoUrl: string | null
  qrisImageUrl: string | null
  store: StoreDetailResponse
}): UpdateStoreRequest {
  const requestBody: UpdateStoreRequest = {}

  if (values.name !== values.store.name) {
    requestBody.name = values.name
  }

  if (values.description !== values.store.description) {
    requestBody.description = values.description
  }

  if (values.address !== values.store.address) {
    requestBody.address = values.address
  }

  if (values.photoUrl !== values.store.photoUrl) {
    requestBody.photoUrl = values.photoUrl
  }

  if (values.qrisImageUrl !== values.store.qrisImageUrl) {
    requestBody.qrisImageUrl = values.qrisImageUrl
  }

  if (values.mapsLink !== values.store.mapsLink) {
    requestBody.mapsLink = values.mapsLink
  }

  return requestBody
}
