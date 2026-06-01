import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import type { PromoSummaryResponse } from '../../../client'
import {
  deletePromoPromosIdDeleteMutation,
  getAllMeStoresMePromosGetQueryKey,
  getAllPromoStoresStoreIdPromosGetQueryKey,
  getPromoDetailsPromosIdGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import { getBackendErrorMessage } from '../../auth/lib/backend-error'

type UseSellerPromoActionsResult = {
  deletePromo: (promo: PromoSummaryResponse) => Promise<void>
  deletingPromoId: string | null
  errorMessage: string | null
}

export function useSellerPromoActions(): UseSellerPromoActionsResult {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [deletingPromoId, setDeletingPromoId] = useState<string | null>(null)
  const deleteMutation = useMutation(deletePromoPromosIdDeleteMutation())

  async function deletePromo(promo: PromoSummaryResponse) {
    if (deletingPromoId) {
      return
    }

    setErrorMessage(null)
    setDeletingPromoId(promo.id)

    try {
      await deleteMutation.mutateAsync({
        path: {
          id: promo.id,
        },
      })

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
              id: promo.id,
            },
          }).queryKey,
        }),
      ])
    } catch (error) {
      setErrorMessage(
        getBackendErrorMessage(error, 'Promo gagal dihapus. Coba lagi.'),
      )
      throw error
    } finally {
      setDeletingPromoId(null)
    }
  }

  return {
    deletePromo,
    deletingPromoId,
    errorMessage,
  }
}
