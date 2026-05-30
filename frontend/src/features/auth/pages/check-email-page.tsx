import { Mail } from 'lucide-react'

import { AuthShell } from '../components/auth-shell'

type CheckEmailPageProps = {
  email?: string
}

export function CheckEmailPage({ email }: CheckEmailPageProps) {
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
    </AuthShell>
  )
}
