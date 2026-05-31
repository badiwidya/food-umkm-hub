import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { verifyEmailAuthEmailVerifyPostMutation } from '../../../client/@tanstack/react-query.gen'

type UseVerifyEmailOptions = {
  token?: string
  tokenId?: string
}

type VerifyEmailStatus = 'error' | 'idle' | 'pending' | 'success'

export function useVerifyEmail({ token, tokenId }: UseVerifyEmailOptions) {
  const navigate = useNavigate()
  const hasSubmittedRef = useRef(false)
  const hasTokenParams = Boolean(token && tokenId)
  const [resultStatus, setResultStatus] = useState<VerifyEmailStatus>(
    hasTokenParams ? 'idle' : 'error',
  )
  const [message, setMessage] = useState<string | null>(
    hasTokenParams ? null : 'Token verifikasi tidak ditemukan.',
  )
  const { isPending, mutateAsync: verifyEmail } = useMutation(
    verifyEmailAuthEmailVerifyPostMutation(),
  )
  const status: VerifyEmailStatus = hasTokenParams
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

    verifyEmail({
      body: {
        token,
        tokenId,
      },
    })
      .then(() => {
        setResultStatus('success')
        void navigate({ to: '/verify-email/success' })
      })
      .catch(() => {
        setResultStatus('error')
        setMessage('Verifikasi email gagal. Tautan mungkin sudah kedaluwarsa.')
      })
  }, [navigate, token, tokenId, verifyEmail])

  return {
    message,
    status,
  }
}
