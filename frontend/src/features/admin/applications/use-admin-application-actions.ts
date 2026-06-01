import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  approveApplicationAdminStoresIdApprovePostMutation,
  getStoreWithOwnerDetailsAdminStoresIdGetOptions,
  listAllAdminStoresGetQueryKey,
  listStoresGetQueryKey,
  rejectApplicationAdminStoresIdRejectPostMutation,
} from '../../../client/@tanstack/react-query.gen'
import { getBackendErrorMessage } from '../../auth/lib/backend-error'

type PendingAdminApplicationAction = {
  action: 'approve' | 'reject'
  storeId: string
} | null

type UseAdminApplicationActionsResult = {
  approveApplication: (storeId: string) => Promise<void>
  errorMessage: string | null
  pendingAction: PendingAdminApplicationAction
  rejectApplication: (storeId: string, reason: string) => Promise<void>
}

export function useAdminApplicationActions(): UseAdminApplicationActionsResult {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pendingAction, setPendingAction] =
    useState<PendingAdminApplicationAction>(null)
  const approveMutation = useMutation(
    approveApplicationAdminStoresIdApprovePostMutation(),
  )
  const rejectMutation = useMutation(
    rejectApplicationAdminStoresIdRejectPostMutation(),
  )

  async function invalidateApplicationQueries(storeId: string) {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: listAllAdminStoresGetQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: listStoresGetQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getStoreWithOwnerDetailsAdminStoresIdGetOptions({
          path: {
            id: storeId,
          },
        }).queryKey,
      }),
    ])
  }

  async function approveApplication(storeId: string) {
    if (pendingAction) {
      return
    }

    setErrorMessage(null)
    setPendingAction({
      action: 'approve',
      storeId,
    })

    try {
      await approveMutation.mutateAsync({
        path: {
          id: storeId,
        },
      })
      await invalidateApplicationQueries(storeId)
    } catch (error) {
      setErrorMessage(
        getBackendErrorMessage(error, 'Aplikasi gagal disetujui. Coba lagi.'),
      )
      throw error
    } finally {
      setPendingAction(null)
    }
  }

  async function rejectApplication(storeId: string, reason: string) {
    if (pendingAction) {
      return
    }

    setErrorMessage(null)
    setPendingAction({
      action: 'reject',
      storeId,
    })

    try {
      await rejectMutation.mutateAsync({
        body: {
          notes: reason,
        },
        path: {
          id: storeId,
        },
      })
      await invalidateApplicationQueries(storeId)
    } catch (error) {
      setErrorMessage(
        getBackendErrorMessage(error, 'Aplikasi gagal ditolak. Coba lagi.'),
      )
      throw error
    } finally {
      setPendingAction(null)
    }
  }

  return {
    approveApplication,
    errorMessage,
    pendingAction,
    rejectApplication,
  }
}
