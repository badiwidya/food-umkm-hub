import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { BaseSyntheticEvent } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type {
  CreatePromoRequest,
  PromoDetailResponse,
  UpdatePromoRequest,
} from '../../../client'
import {
  createPromoPromosPostMutation,
  getAllMeStoresMePromosGetQueryKey,
  getAllPromoStoresStoreIdPromosGetQueryKey,
  getPromoDetailsPromosIdGetOptions,
  updatePromoInformationPromosIdPatchMutation,
} from '../../../client/@tanstack/react-query.gen'
import { getBackendErrorMessage } from '../../auth/lib/backend-error'

const PROMO_TYPES = ['fixed', 'percentage'] as const

const promoFormSchema = z
  .object({
    code: z.string().trim().min(1, 'Kode promo wajib diisi.'),
    endDate: z.string().trim().min(1, 'Tanggal selesai wajib diisi.'),
    maxDiscountAmount: z.string().trim(),
    maxUsage: z.string().trim(),
    minOrderAmount: z.string().trim(),
    startDate: z.string().trim().min(1, 'Tanggal mulai wajib diisi.'),
    type: z.enum(PROMO_TYPES),
    value: z.string().trim().min(1, 'Nilai promo wajib diisi.'),
  })
  .superRefine((values, context) => {
    const value = parseIntegerField(values.value)
    const minOrderAmount = parseNullableIntegerField(values.minOrderAmount)
    const maxUsage = parseNullableIntegerField(values.maxUsage)
    const maxDiscountAmount = parseNullableIntegerField(
      values.maxDiscountAmount,
    )
    const startDate = parseDateTimeField(values.startDate)
    const endDate = parseDateTimeField(values.endDate)

    if (value === null) {
      context.addIssue({
        code: 'custom',
        message: 'Nilai promo harus berupa angka bulat.',
        path: ['value'],
      })
    } else if (values.type === 'percentage' && (value < 1 || value > 100)) {
      context.addIssue({
        code: 'custom',
        message: 'Diskon persentase harus 1 sampai 100.',
        path: ['value'],
      })
    } else if (values.type === 'fixed' && value <= 0) {
      context.addIssue({
        code: 'custom',
        message: 'Potongan harga harus lebih dari 0.',
        path: ['value'],
      })
    }

    if (minOrderAmount === undefined) {
      context.addIssue({
        code: 'custom',
        message: 'Minimum belanja harus berupa angka bulat.',
        path: ['minOrderAmount'],
      })
    }

    if (maxUsage === undefined) {
      context.addIssue({
        code: 'custom',
        message: 'Batas penggunaan harus berupa angka bulat.',
        path: ['maxUsage'],
      })
    }

    if (values.type === 'percentage' && maxDiscountAmount === undefined) {
      context.addIssue({
        code: 'custom',
        message: 'Maksimum diskon harus berupa angka bulat.',
        path: ['maxDiscountAmount'],
      })
    }

    if (!startDate) {
      context.addIssue({
        code: 'custom',
        message: 'Tanggal mulai tidak valid.',
        path: ['startDate'],
      })
    }

    if (!endDate) {
      context.addIssue({
        code: 'custom',
        message: 'Tanggal selesai tidak valid.',
        path: ['endDate'],
      })
    }

    if (startDate && endDate && endDate <= startDate) {
      context.addIssue({
        code: 'custom',
        message: 'Tanggal selesai harus setelah tanggal mulai.',
        path: ['endDate'],
      })
    }
  })
  .transform((values) => ({
    code: values.code.toUpperCase(),
    endDate: toIsoDateTime(values.endDate),
    maxDiscountAmount:
      values.type === 'percentage'
        ? (parseNullableIntegerField(values.maxDiscountAmount) ?? null)
        : null,
    maxUsage: parseNullableIntegerField(values.maxUsage) ?? null,
    minOrderAmount: parseNullableIntegerField(values.minOrderAmount) ?? null,
    startDate: toIsoDateTime(values.startDate),
    type: values.type,
    value: parseIntegerField(values.value) ?? 0,
  }))

export type PromoFormValues = z.input<typeof promoFormSchema>

type PromoFormMode =
  | {
      kind: 'create'
    }
  | {
      kind: 'edit'
      promo: PromoDetailResponse
    }

type UsePromoFormResult = {
  form: ReturnType<typeof useForm<PromoFormValues>>
  formError: string | null
  isPending: boolean
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>
}

export function usePromoForm(mode: PromoFormMode): UsePromoFormResult {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const createPromoMutation = useMutation(createPromoPromosPostMutation())
  const updatePromoMutation = useMutation(
    updatePromoInformationPromosIdPatchMutation(),
  )
  const form = useForm<PromoFormValues>({
    defaultValues: getDefaultValues(mode),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    const parsedValues = promoFormSchema.safeParse(values)

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (
          fieldName === 'code' ||
          fieldName === 'endDate' ||
          fieldName === 'maxDiscountAmount' ||
          fieldName === 'maxUsage' ||
          fieldName === 'minOrderAmount' ||
          fieldName === 'startDate' ||
          fieldName === 'type' ||
          fieldName === 'value'
        ) {
          form.setError(fieldName, {
            message: issue.message,
            type: 'validate',
          })
        }
      }

      return
    }

    setIsSaving(true)

    try {
      if (mode.kind === 'create') {
        const requestBody = toCreatePromoRequest(parsedValues.data)
        const promo = await createPromoMutation.mutateAsync({
          body: requestBody,
        })

        await invalidatePromoQueries(queryClient, {
          promoId: promo.id,
          storeId: promo.storeId,
        })
      } else {
        const requestBody = toUpdatePromoRequest(parsedValues.data)

        await updatePromoMutation.mutateAsync({
          body: requestBody,
          path: {
            id: mode.promo.id,
          },
        })

        await invalidatePromoQueries(queryClient, {
          promoId: mode.promo.id,
          storeId: mode.promo.storeId,
        })
      }

      await navigate({
        to: '/seller/promos',
      })
    } catch (error) {
      setFormError(
        getBackendErrorMessage(
          error,
          mode.kind === 'create'
            ? 'Promo gagal dibuat. Coba lagi.'
            : 'Promo gagal diperbarui. Coba lagi.',
        ),
      )
      setIsSaving(false)
    }
  })

  return {
    form,
    formError,
    isPending: isSaving,
    onSubmit,
  }
}

function toCreatePromoRequest(
  values: z.output<typeof promoFormSchema>,
): CreatePromoRequest {
  return {
    code: values.code,
    endDate: values.endDate,
    maxDiscountAmount: values.maxDiscountAmount,
    maxUsage: values.maxUsage,
    minOrderAmount: values.minOrderAmount,
    startDate: values.startDate,
    type: values.type,
    value: values.value,
  }
}

function toUpdatePromoRequest(
  values: z.output<typeof promoFormSchema>,
): UpdatePromoRequest {
  return {
    code: values.code,
    endDate: values.endDate,
    maxDiscountAmount: values.maxDiscountAmount,
    maxUsage: values.maxUsage,
    minOrderAmount: values.minOrderAmount,
    startDate: values.startDate,
    type: values.type,
    value: values.value,
  }
}

function getDefaultValues(mode: PromoFormMode): PromoFormValues {
  if (mode.kind === 'create') {
    return {
      code: '',
      endDate: '',
      maxDiscountAmount: '',
      maxUsage: '',
      minOrderAmount: '',
      startDate: '',
      type: 'fixed',
      value: '',
    }
  }

  return {
    code: mode.promo.code,
    endDate: toDateTimeLocal(mode.promo.endDate),
    maxDiscountAmount:
      mode.promo.maxDiscountAmount === null
        ? ''
        : String(mode.promo.maxDiscountAmount),
    maxUsage: mode.promo.maxUsage === null ? '' : String(mode.promo.maxUsage),
    minOrderAmount:
      mode.promo.minOrderAmount === null
        ? ''
        : String(mode.promo.minOrderAmount),
    startDate: toDateTimeLocal(mode.promo.startDate),
    type: mode.promo.type,
    value: String(mode.promo.value),
  }
}

async function invalidatePromoQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  promo: {
    promoId: string
    storeId: string
  },
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: getAllMeStoresMePromosGetQueryKey(),
    }),
    queryClient.invalidateQueries({
      queryKey: getAllPromoStoresStoreIdPromosGetQueryKey({
        path: {
          store_id: promo.storeId,
        },
      }),
    }),
    queryClient.invalidateQueries({
      queryKey: getPromoDetailsPromosIdGetOptions({
        path: {
          id: promo.promoId,
        },
      }).queryKey,
    }),
  ])
}

function parseIntegerField(value: string) {
  if (!/^\d+$/.test(value)) {
    return null
  }

  return Number(value)
}

function parseNullableIntegerField(value: string) {
  if (value === '') {
    return null
  }

  if (!/^\d+$/.test(value)) {
    return undefined
  }

  return Number(value)
}

function parseDateTimeField(value: string) {
  const date = new Date(value)
  const time = date.getTime()

  return Number.isNaN(time) ? null : time
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString()
}

function toDateTimeLocal(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const hours = padDatePart(date.getHours())
  const minutes = padDatePart(date.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}
