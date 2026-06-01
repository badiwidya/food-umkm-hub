import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { verifyEmailChangeAuthEmailChangeVerifyPostMutation } from '../../../client/@tanstack/react-query.gen'

type UseVerifyEmailChangeOptions = {
  token?: string
  tokenId?: string
}

type VerifyEmailChangeStatus = 'error' | 'idle' | 'pending' | 'success'

export function useVerifyEmailChange({
  token,
  tokenId,
}: UseVerifyEmailChangeOptions) {
  const navigate = useNavigate()
  const hasSubmittedRef = useRef(false)
  const hasTokenParams = Boolean(token && tokenId)
  const [resultStatus, setResultStatus] = useState<VerifyEmailChangeStatus>(
    hasTokenParams ? 'idle' : 'error',
  )
  const [message, setMessage] = useState<string | null>(
    hasTokenParams ? null : 'Token verifikasi tidak ditemukan.',
  )
  const { isPending, mutateAsync: verifyEmailChange } = useMutation(
    verifyEmailChangeAuthEmailChangeVerifyPostMutation(),
  )
  const status: VerifyEmailChangeStatus = hasTokenParams
    ? isPending
      ? 'pending'
      : resultStatus
    : 'error'

  useEffect(() => {
    if (!token || !tokenId) {
      return
    }

    if (hasSubmittedRef.current) {
      return
    }

    hasSubmittedRef.current = true

    verifyEmailChange({
      body: {
        token,
        tokenId,
      },
    })
      .then(() => {
        setResultStatus('success')
        void navigate({ to: '/change-email/success' })
      })
      .catch(() => {
        setResultStatus('error')
        setMessage(
          'Verifikasi perubahan email gagal. Tautan mungkin sudah kedaluwarsa.',
        )
      })
  }, [navigate, token, tokenId, verifyEmailChange])

  return {
    message,
    status,
  }
}
