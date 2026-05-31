import { LoaderCircle, MailCheck, MailWarning } from 'lucide-react'

import { AuthButton } from '../components/auth-button'
import { AuthShell } from '../components/auth-shell'
import { useVerifyEmail } from '../hooks/use-verify-email'

type VerifyEmailPageProps = {
  token?: string
  tokenId?: string
}

export function VerifyEmailPage({ token, tokenId }: VerifyEmailPageProps) {
  const { message, status } = useVerifyEmail({ token, tokenId })
  const isPending = status === 'idle' || status === 'pending'
  const isSuccess = status === 'success'

  return (
    <AuthShell variant="status">
      {isPending ? (
        <LoaderCircle
          aria-hidden="true"
          className="mb-8 size-24 animate-spin text-slate-900"
        />
      ) : isSuccess ? (
        <MailCheck aria-hidden="true" className="mb-8 size-24 text-slate-900" />
      ) : (
        <MailWarning
          aria-hidden="true"
          className="mb-8 size-24 text-slate-900"
        />
      )}
      <h1 className="text-xl font-medium leading-7 text-slate-800">
        Verifikasi Email
      </h1>
      <p className="mt-4 text-sm leading-5 text-slate-500">
        {isPending
          ? 'Memproses verifikasi email...'
          : isSuccess
            ? 'Email berhasil diverifikasi.'
            : message}
      </p>
      {status === 'error' ? (
        <div className="mt-8 w-full max-w-[257px] space-y-3">
          <AuthButton
            onClick={() => {
              window.location.assign('/login')
            }}
          >
            Kembali ke Login
          </AuthButton>
          <a
            className="inline-block text-sm font-medium leading-5 text-[#1e40af] hover:underline"
            href="/register/student"
          >
            Daftar ulang
          </a>
        </div>
      ) : null}
    </AuthShell>
  )
}
