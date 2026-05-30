import { Mail } from 'lucide-react'

import { AuthButton } from '../components/auth-button'
import { AuthShell } from '../components/auth-shell'
import { useResendVerificationEmail } from '../hooks/use-resend-verification-email'

type CheckEmailPageProps = {
  email?: string
}

export function CheckEmailPage({ email }: CheckEmailPageProps) {
  const { isPending, message, resendVerificationEmail } =
    useResendVerificationEmail({ email })

  return (
    <AuthShell variant="status">
      <Mail aria-hidden="true" className="mb-8 size-24 text-slate-900" />
      <h1 className="text-xl font-medium leading-7 text-slate-800">
        Silahkan cek email anda untuk verifikasi
      </h1>
      {email ? (
        <p className="mt-4 break-words text-sm leading-5 text-slate-500">
          {email}
        </p>
      ) : null}
      <div className="mt-8 w-full max-w-[257px] space-y-3">
        <AuthButton
          disabled={isPending || !email}
          onClick={() => void resendVerificationEmail()}
        >
          {isPending ? 'Mengirim...' : 'Kirim Ulang Email'}
        </AuthButton>
        {message ? (
          <p className="text-sm leading-5 text-slate-500">{message}</p>
        ) : null}
        <a
          className="inline-block text-sm font-medium leading-5 text-[#1e40af] hover:underline"
          href="/login"
        >
          Kembali ke Login
        </a>
      </div>
    </AuthShell>
  )
}
