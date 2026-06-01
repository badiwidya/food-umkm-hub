import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import type { BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type {
  CreateProductRequest,
  ProductDetailResponse,
  UpdateProductRequest,
} from '../../../client'
import {
  createProductProductsPostMutation,
  getAllProductsProductsGetQueryKey,
  getMyDashboardStoresMeDashboardGetOptions,
  getMyProductsStoresMeProductsGetQueryKey,
  getProductDetailsProductsIdGetOptions,
  getProductsByStoreStoresStoreIdProductsGetQueryKey,
  updateProductInformationProductsIdPatchMutation,
} from '../../../client/@tanstack/react-query.gen'
import { getBackendErrorMessage } from '../../auth/lib/backend-error'
import {
  uploadProductPhoto,
  validateProductPhotoFile,
} from './product-photo-upload'

const PRODUCT_CATEGORIES = ['food', 'drink', 'snack', 'other'] as const

const productFormSchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES),
  description: z.string().trim().transform(toNullableText),
  name: z.string().trim().min(1, 'Nama produk wajib diisi.'),
  price: z
    .string()
    .trim()
    .min(1, 'Harga wajib diisi.')
    .regex(/^\d+$/, 'Harga harus berupa angka bulat.')
    .transform((value) => Number(value))
    .refine((value) => value >= 0, 'Harga tidak boleh negatif.'),
})

export type ProductFormValues = z.input<typeof productFormSchema>

type ProductFormMode =
  | {
      kind: 'create'
    }
  | {
      kind: 'edit'
      product: ProductDetailResponse
    }

type UseProductFormResult = {
  existingPhotoUrl: string | null
  form: ReturnType<typeof useForm<ProductFormValues>>
  formError: string | null
  isPending: boolean
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>
  photoError: string | null
  photoFile: File | null
  photoPreviewUrl: string | null
  setPhoto: (file: File | null) => void
}

export function useProductForm(mode: ProductFormMode): UseProductFormResult {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const createProductMutation = useMutation(createProductProductsPostMutation())
  const updateProductMutation = useMutation(
    updateProductInformationProductsIdPatchMutation(),
  )
  const form = useForm<ProductFormValues>({
    defaultValues: getDefaultValues(mode),
  })

  const photoPreviewUrl = useMemo(() => {
    if (!photoFile) {
      return null
    }

    return URL.createObjectURL(photoFile)
  }, [photoFile])

  useEffect(() => {
    if (!photoPreviewUrl) {
      return
    }

    return () => {
      URL.revokeObjectURL(photoPreviewUrl)
    }
  }, [photoPreviewUrl])

  function setPhoto(file: File | null) {
    setPhotoError(null)

    if (!file) {
      setPhotoFile(null)
      return
    }

    const validationError = validateProductPhotoFile(file)

    if (validationError) {
      setPhotoError(validationError)
      setPhotoFile(null)
      return
    }

    setPhotoFile(file)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    const parsedValues = productFormSchema.safeParse(values)

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (
          fieldName === 'category' ||
          fieldName === 'description' ||
          fieldName === 'name' ||
          fieldName === 'price'
        ) {
          form.setError(fieldName, {
            message: issue.message,
            type: 'validate',
          })
        }
      }

      return
    }

    if (photoError) {
      return
    }

    setIsSaving(true)

    try {
      const nextPhotoUrl = photoFile
        ? await uploadProductPhoto(photoFile)
        : getExistingPhotoUrl(mode)

      if (mode.kind === 'create') {
        const requestBody = toCreateProductRequest({
          ...parsedValues.data,
          photoUrl: nextPhotoUrl,
        })

        await createProductMutation.mutateAsync({
          body: requestBody,
        })
      } else {
        const requestBody = toUpdateProductRequest({
          ...parsedValues.data,
          photoUrl: nextPhotoUrl,
        })

        await updateProductMutation.mutateAsync({
          body: requestBody,
          path: {
            id: mode.product.id,
          },
        })
      }

      await invalidateProductQueries(queryClient, mode)

      await navigate({
        to: '/seller/products',
      })
    } catch (error) {
      setFormError(
        getBackendErrorMessage(
          error,
          mode.kind === 'create'
            ? 'Produk gagal dibuat. Coba lagi.'
            : 'Produk gagal diperbarui. Coba lagi.',
        ),
      )
      setIsSaving(false)
    }
  })

  return {
    existingPhotoUrl: getExistingPhotoUrl(mode),
    form,
    formError,
    isPending: isSaving,
    onSubmit,
    photoError,
    photoFile,
    photoPreviewUrl,
    setPhoto,
  }
}

function toNullableText(value: string) {
  return value || null
}

function toCreateProductRequest(
  values: z.output<typeof productFormSchema> & {
    photoUrl: string | null
  },
): CreateProductRequest {
  return {
    category: values.category,
    description: values.description,
    name: values.name,
    photoUrl: values.photoUrl,
    price: values.price,
  }
}

function toUpdateProductRequest(
  values: z.output<typeof productFormSchema> & {
    photoUrl: string | null
  },
): UpdateProductRequest {
  return {
    category: values.category,
    description: values.description,
    name: values.name,
    photoUrl: values.photoUrl,
    price: values.price,
  }
}

function getDefaultValues(mode: ProductFormMode): ProductFormValues {
  if (mode.kind === 'create') {
    return {
      category: 'food',
      description: '',
      name: '',
      price: '',
    }
  }

  return {
    category: mode.product.category,
    description: mode.product.description ?? '',
    name: mode.product.name,
    price: String(mode.product.price),
  }
}

function getExistingPhotoUrl(mode: ProductFormMode) {
  return mode.kind === 'edit' ? mode.product.photoUrl : null
}

async function invalidateProductQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  mode: ProductFormMode,
) {
  const invalidations = [
    queryClient.invalidateQueries({
      queryKey: getMyProductsStoresMeProductsGetQueryKey(),
    }),
    queryClient.invalidateQueries({
      queryKey: getMyDashboardStoresMeDashboardGetOptions().queryKey,
    }),
    queryClient.invalidateQueries({
      queryKey: getAllProductsProductsGetQueryKey(),
    }),
  ]

  if (mode.kind === 'edit') {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: getProductDetailsProductsIdGetOptions({
          path: {
            id: mode.product.id,
          },
        }).queryKey,
      }),
    )
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: getProductsByStoreStoresStoreIdProductsGetQueryKey({
          path: {
            store_id: mode.product.store.id,
          },
        }),
      }),
    )
  }

  await Promise.all(invalidations)
}
