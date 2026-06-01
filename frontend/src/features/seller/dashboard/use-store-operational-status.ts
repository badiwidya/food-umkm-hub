import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import type { ErrorResponse } from '../../../client'
import {
  closeMeStoresMeClosePostMutation,
  getMeStoresMeGetOptions,
  getMyDashboardStoresMeDashboardGetOptions,
  openMeStoresMeOpenPostMutation,
} from '../../../client/@tanstack/react-query.gen'

type UseStoreOperationalStatusResult = {
  errorMessage: string | null
  isPending: boolean
  toggleStatus: (isOpen: boolean) => Promise<void>
}

export function useStoreOperationalStatus(): UseStoreOperationalStatusResult {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const openStoreMutation = useMutation(openMeStoresMeOpenPostMutation())
  const closeStoreMutation = useMutation(closeMeStoresMeClosePostMutation())
  const isPending = openStoreMutation.isPending || closeStoreMutation.isPending

  async function toggleStatus(isOpen: boolean) {
    if (isPending) {
      return
    }

    setErrorMessage(null)

    try {
      if (isOpen) {
        await closeStoreMutation.mutateAsync({})
      } else {
        await openStoreMutation.mutateAsync({})
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getMeStoresMeGetOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getMyDashboardStoresMeDashboardGetOptions().queryKey,
        }),
      ])
    } catch (error) {
      setErrorMessage(getOperationalStatusErrorMessage(error))
    }
  }

  return {
    errorMessage,
    isPending,
    toggleStatus,
  }
}

function getOperationalStatusErrorMessage(error: unknown) {
  if (isErrorResponse(error) && error.message) {
    return error.message
  }

  return 'Status toko gagal diperbarui. Coba lagi.'
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  )
}
