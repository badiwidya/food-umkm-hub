import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { resendEmailVerificationAuthEmailResendPostMutation } from '../../../client/@tanstack/react-query.gen'

type UseResendVerificationEmailOptions = {
  email?: string
}

export function useResendVerificationEmail({
  email,
}: UseResendVerificationEmailOptions) {
  const [message, setMessage] = useState<string | null>(null)
  const resendMutation = useMutation(
    resendEmailVerificationAuthEmailResendPostMutation(),
  )

  async function resendVerificationEmail() {
    if (!email) {
      setMessage('Email tidak ditemukan.')
      return
    }

    setMessage(null)

    try {
      await resendMutation.mutateAsync({
        body: {
          email,
        },
      })
      setMessage('Email verifikasi telah dikirim ulang.')
    } catch {
      setMessage('Gagal mengirim ulang email verifikasi.')
    }
  }

  return {
    isPending: resendMutation.isPending,
    message,
    resendVerificationEmail,
  }
}
