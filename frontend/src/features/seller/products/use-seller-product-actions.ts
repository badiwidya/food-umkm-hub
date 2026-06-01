import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import type { ErrorResponse, ProductSummaryResponse } from '../../../client'
import {
  deleteProductProductsIdDeleteMutation,
  getAllProductsProductsGetQueryKey,
  getMyDashboardStoresMeDashboardGetOptions,
  getMyProductsStoresMeProductsGetQueryKey,
  getProductDetailsProductsIdGetOptions,
  getProductsByStoreStoresStoreIdProductsGetQueryKey,
  updateProductAvailabilityProductsIdAvailabilityPatchMutation,
} from '../../../client/@tanstack/react-query.gen'

type UseSellerProductActionsResult = {
  deletingProductId: string | null
  errorMessage: string | null
  pendingAvailabilityProductId: string | null
  deleteProduct: (product: ProductSummaryResponse) => Promise<void>
  toggleAvailability: (product: ProductSummaryResponse) => Promise<void>
}

export function useSellerProductActions(): UseSellerProductActionsResult {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pendingAvailabilityProductId, setPendingAvailabilityProductId] =
    useState<string | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  )
  const availabilityMutation = useMutation(
    updateProductAvailabilityProductsIdAvailabilityPatchMutation(),
  )
  const deleteMutation = useMutation(deleteProductProductsIdDeleteMutation())

  async function invalidateProductQueries(product: ProductSummaryResponse) {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getMyProductsStoresMeProductsGetQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getMyDashboardStoresMeDashboardGetOptions().queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: getAllProductsProductsGetQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getProductDetailsProductsIdGetOptions({
          path: {
            id: product.id,
          },
        }).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: getProductsByStoreStoresStoreIdProductsGetQueryKey({
          path: {
            store_id: product.store.id,
          },
        }),
      }),
    ])
  }

  async function toggleAvailability(product: ProductSummaryResponse) {
    if (pendingAvailabilityProductId || deletingProductId) {
      return
    }

    setErrorMessage(null)
    setPendingAvailabilityProductId(product.id)

    try {
      await availabilityMutation.mutateAsync({
        body: {
          isAvailable: !product.isAvailable,
        },
        path: {
          id: product.id,
        },
      })

      await invalidateProductQueries(product)
    } catch (error) {
      setErrorMessage(getProductActionErrorMessage(error, 'availability'))
    } finally {
      setPendingAvailabilityProductId(null)
    }
  }

  async function deleteProduct(product: ProductSummaryResponse) {
    if (deletingProductId || pendingAvailabilityProductId) {
      return
    }

    setErrorMessage(null)
    setDeletingProductId(product.id)

    try {
      await deleteMutation.mutateAsync({
        path: {
          id: product.id,
        },
      })

      await invalidateProductQueries(product)
    } catch (error) {
      setErrorMessage(getProductActionErrorMessage(error, 'delete'))
      throw error
    } finally {
      setDeletingProductId(null)
    }
  }

  return {
    deleteProduct,
    deletingProductId,
    errorMessage,
    pendingAvailabilityProductId,
    toggleAvailability,
  }
}

function getProductActionErrorMessage(
  error: unknown,
  action: 'availability' | 'delete',
) {
  if (isErrorResponse(error) && error.message) {
    return error.message
  }

  if (action === 'availability') {
    return 'Status produk gagal diperbarui. Coba lagi.'
  }

  return 'Produk gagal dihapus. Coba lagi.'
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  )
}
