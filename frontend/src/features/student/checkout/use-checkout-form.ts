import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import type {
  CreateOrderRequest,
  PaymentMethod,
  ValidatePromoResponse,
} from '../../../client'
import {
  createOrderOrdersPostMutation,
  getOrderDetailsOrdersIdGetQueryKey,
  getOrdersByStudentOrdersGetQueryKey,
  updatePaymentProofOrdersIdPaymentProofPostMutation,
  validatePromoPromosValidatePostMutation,
} from '../../../client/@tanstack/react-query.gen'
import type { CartItem } from '../../../stores/cart-store'
import { useCartStore } from '../../../stores/cart-store'
import { getCartSubtotal } from '../cart/cart-selectors'
import { getCheckoutErrorMessage } from './api-error'
import {
  uploadPaymentProof,
  validatePaymentProofFile,
} from './payment-proof-upload'

const checkoutFormSchema = z.object({
  notes: z.string().max(500, 'Catatan maksimal 500 karakter.'),
  paymentMethod: z.enum(['cash', 'qris']),
  promoCode: z.string().max(40, 'Kode promo maksimal 40 karakter.'),
})

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

export type AppliedPromo = ValidatePromoResponse & {
  orderAmount: number
}

type UseCheckoutFormOptions = {
  clearCartOnSuccess: boolean
  defaultNotes?: string
  items: Array<CartItem>
  qrisImageUrl: string | null
  storeId: string | null
}

export function useCheckoutForm({
  clearCartOnSuccess,
  defaultNotes = '',
  items,
  qrisImageUrl,
  storeId,
}: UseCheckoutFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearCart = useCartStore((state) => state.clearCart)
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null)
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofError, setPaymentProofError] = useState<string | null>(
    null,
  )
  const [promoError, setPromoError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm<CheckoutFormValues>({
    defaultValues: {
      notes: defaultNotes,
      paymentMethod: 'cash',
      promoCode: '',
    },
  })
  const validatePromoMutation = useMutation(
    validatePromoPromosValidatePostMutation(),
  )
  const createOrderMutation = useMutation(createOrderOrdersPostMutation())
  const updatePaymentProofMutation = useMutation(
    updatePaymentProofOrdersIdPaymentProofPostMutation(),
  )
  const subtotal = getCartSubtotal(items)
  const isPromoStale =
    appliedPromo !== null && appliedPromo.orderAmount !== subtotal
  const paymentMethod = useWatch({
    control: form.control,
    name: 'paymentMethod',
  })

  async function handleApplyPromo() {
    setPromoError(null)
    setSubmitError(null)

    const parsedValues = checkoutFormSchema.safeParse(form.getValues())

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (fieldName === 'promoCode' || fieldName === 'notes') {
          form.setError(fieldName, {
            message: issue.message,
            type: 'validate',
          })
        }
      }

      return
    }

    const code = parsedValues.data.promoCode.trim()

    if (!code) {
      setAppliedPromo(null)
      setPromoError('Masukkan kode promo terlebih dahulu.')
      return
    }

    if (!storeId) {
      setAppliedPromo(null)
      setPromoError('Keranjang belum memiliki UMKM.')
      return
    }

    try {
      const promo = await validatePromoMutation.mutateAsync({
        body: {
          code,
          orderAmount: subtotal,
          storeId,
        },
      })

      setAppliedPromo({
        ...promo,
        orderAmount: subtotal,
      })
      form.setValue('promoCode', promo.promoCode)
    } catch (error) {
      setAppliedPromo(null)
      setPromoError(
        getCheckoutErrorMessage(error, 'Kode promo tidak dapat digunakan.'),
      )
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null)
    setPromoError(null)
    form.setValue('promoCode', '')
  }

  function handlePaymentMethodChange(nextPaymentMethod: PaymentMethod) {
    if (nextPaymentMethod === 'qris' && !qrisImageUrl) {
      return
    }

    form.setValue('paymentMethod', nextPaymentMethod, {
      shouldDirty: true,
      shouldValidate: true,
    })
    setSubmitError(null)
    setPaymentProofError(null)

    if (nextPaymentMethod === 'cash') {
      setPaymentProofFile(null)
    }
  }

  function handlePaymentProofChange(file: File | null) {
    setSubmitError(null)

    if (!file) {
      setPaymentProofFile(null)
      setPaymentProofError(null)
      return
    }

    const validationError = validatePaymentProofFile(file)

    if (validationError) {
      setPaymentProofFile(null)
      setPaymentProofError(validationError)
      return
    }

    setPaymentProofFile(file)
    setPaymentProofError(null)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)
    setPromoError(null)
    setPaymentProofError(null)

    const parsedValues = checkoutFormSchema.safeParse(values)

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (
          fieldName === 'promoCode' ||
          fieldName === 'notes' ||
          fieldName === 'paymentMethod'
        ) {
          form.setError(fieldName, {
            message: issue.message,
            type: 'validate',
          })
        }
      }

      return
    }

    if (!storeId || items.length === 0) {
      setSubmitError('Keranjang kosong atau UMKM tidak ditemukan.')
      return
    }

    if (parsedValues.data.paymentMethod === 'qris' && !qrisImageUrl) {
      setSubmitError('QRIS belum tersedia untuk UMKM ini.')
      return
    }

    if (parsedValues.data.paymentMethod === 'qris' && !paymentProofFile) {
      setPaymentProofError('Upload bukti pembayaran terlebih dahulu.')
      return
    }

    const promoCode = parsedValues.data.promoCode.trim()

    if (promoCode && (!appliedPromo || isPromoStale)) {
      setPromoError('Validasikan ulang kode promo sebelum membuat pesanan.')
      return
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        body: {
          notes: getOrderNotes(parsedValues.data.notes, items),
          orderItems: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          paymentMethod: parsedValues.data.paymentMethod,
          promoCode: appliedPromo?.promoCode ?? null,
          storeId,
        } satisfies CreateOrderRequest,
      })
      const orderWithProof =
        parsedValues.data.paymentMethod === 'qris' && paymentProofFile
          ? await updatePaymentProofMutation.mutateAsync({
              body: {
                paymentProofUrl: await uploadPaymentProof(paymentProofFile),
              },
              path: {
                id: order.id,
              },
            })
          : order

      queryClient.setQueryData(
        getOrderDetailsOrdersIdGetQueryKey({
          path: {
            id: orderWithProof.id,
          },
        }),
        orderWithProof,
      )
      await queryClient.invalidateQueries({
        queryKey: getOrdersByStudentOrdersGetQueryKey(),
      })
      if (clearCartOnSuccess) {
        clearCart()
      }
      await navigate({
        params: {
          orderId: orderWithProof.id,
        },
        to: '/orders/$orderId/success',
      })
    } catch (error) {
      setSubmitError(
        getCheckoutErrorMessage(error, 'Pesanan gagal dibuat. Coba lagi.'),
      )
    }
  })

  return {
    appliedPromo,
    form,
    handleApplyPromo,
    handlePaymentMethodChange,
    handlePaymentProofChange,
    handleRemovePromo,
    isPending:
      createOrderMutation.isPending || updatePaymentProofMutation.isPending,
    isPromoPending: validatePromoMutation.isPending,
    isPromoStale,
    onSubmit,
    paymentMethod,
    paymentProofError,
    paymentProofFile,
    promoError,
    submitError,
  }
}

function getOrderNotes(notes: string, items: Array<CartItem>) {
  const trimmedNotes = notes.trim()

  if (trimmedNotes) {
    return trimmedNotes
  }

  const itemNotes = items
    .filter((item) => item.note.trim())
    .map((item) => `${item.productName}: ${item.note.trim()}`)

  return itemNotes.length > 0 ? itemNotes.join('\n') : null
}
