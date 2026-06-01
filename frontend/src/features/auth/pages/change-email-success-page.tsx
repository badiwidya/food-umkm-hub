import { Check } from 'lucide-react'

import { AuthShell } from '../components/auth-shell'

export function ChangeEmailSuccessPage() {
  return (
    <AuthShell variant="status">
      <Check aria-hidden="true" className="mb-16 size-24 text-slate-900" />
      <h1 className="text-xl font-medium leading-7 text-slate-800">
        Email Berhasil Diubah
      </h1>
      <p className="mt-8 text-xl font-medium leading-7 text-slate-800">
        Silahkan Kembali ke Beranda untuk Melanjutkan
      </p>
      <a
        className="mt-14 flex min-h-11 w-full max-w-[257px] items-center justify-center rounded-lg bg-[#1e40af] px-4 py-2 text-center text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e40af]"
        href="/"
      >
        Kembali ke Beranda
      </a>
    </AuthShell>
  )
}
