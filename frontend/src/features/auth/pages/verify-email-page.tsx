import { MailWarning } from 'lucide-react'

import { AuthShell } from '../components/auth-shell'

type VerifyEmailPageProps = {
  token?: string
  tokenId?: string
}

export function VerifyEmailPage({ token, tokenId }: VerifyEmailPageProps) {
  const hasTokenParams = Boolean(token && tokenId)

  return (
    <AuthShell variant="status">
      <MailWarning aria-hidden="true" className="mb-8 size-24 text-slate-900" />
      <h1 className="text-xl font-medium leading-7 text-slate-800">
        Verifikasi Email
      </h1>
      <p className="mt-4 text-sm leading-5 text-slate-500">
        {hasTokenParams
          ? 'Token verifikasi siap diproses pada iterasi berikutnya.'
          : 'Token verifikasi tidak ditemukan.'}
      </p>
    </AuthShell>
  )
}
