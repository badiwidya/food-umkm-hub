import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  getMeStoresMeGetOptions,
  getMyDashboardStoresMeDashboardGetOptions,
  resubmitApplicationStoresMeResubmitPostMutation,
} from '../../../client/@tanstack/react-query.gen'
import { getBackendErrorMessage } from '../../auth/lib/backend-error'

type UseStoreRegistrationResubmitResult = {
  errorMessage: string | null
  isPending: boolean
  resubmit: () => Promise<void>
}

export function useStoreRegistrationResubmit(): UseStoreRegistrationResubmitResult {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const resubmitMutation = useMutation(
    resubmitApplicationStoresMeResubmitPostMutation(),
  )

  async function resubmit() {
    if (resubmitMutation.isPending) {
      return
    }

    setErrorMessage(null)

    try {
      await resubmitMutation.mutateAsync({})

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getMeStoresMeGetOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getMyDashboardStoresMeDashboardGetOptions().queryKey,
        }),
      ])
    } catch (error) {
      setErrorMessage(
        getBackendErrorMessage(
          error,
          'Pendaftaran gagal diajukan ulang. Coba lagi.',
        ),
      )
    }
  }

  return {
    errorMessage,
    isPending: resubmitMutation.isPending,
    resubmit,
  }
}
