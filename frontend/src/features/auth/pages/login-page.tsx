import { Lock, Mail } from 'lucide-react'

import { AuthButton } from '../components/auth-button'
import { AuthPasswordField, AuthTextField } from '../components/auth-field'
import { AuthShell } from '../components/auth-shell'
import { useLoginForm } from '../hooks/use-login-form'

type LoginPageProps = {
  redirect?: string
}

export function LoginPage({ redirect }: LoginPageProps) {
  const { form, formError, isPending, onSubmit } = useLoginForm({ redirect })
  const emailError = form.formState.errors.email?.message
  const passwordError = form.formState.errors.password?.message

  return (
    <AuthShell
      subtitle="Platform Makanan & UMKM Mahasiswa"
      title="IPB Food Hub"
    >
      <div className="space-y-6">
        <h2 className="text-center text-xl font-medium leading-7 text-slate-800">
          Masuk ke Akun Anda
        </h2>

        <form className="space-y-4" onSubmit={onSubmit}>
          {formError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
              {formError}
            </p>
          ) : null}
          <AuthTextField
            autoComplete="email"
            icon={<Mail aria-hidden="true" className="size-5" />}
            label="Email"
            placeholder="Masukkan email"
            required
            type="email"
            {...form.register('email')}
          />
          {emailError ? (
            <p className="text-sm leading-5 text-red-600">{emailError}</p>
          ) : null}
          <AuthPasswordField
            autoComplete="current-password"
            icon={<Lock aria-hidden="true" className="size-5" />}
            label="Password"
            placeholder="Masukkan password"
            required
            {...form.register('password')}
          />
          {passwordError ? (
            <p className="text-sm leading-5 text-red-600">{passwordError}</p>
          ) : null}
          <a
            className="inline-block text-sm font-medium leading-5 text-[#1e40af] hover:underline"
            href="/login"
          >
            Lupa password?
          </a>
          <AuthButton disabled={isPending} type="submit">
            {isPending ? 'Memproses...' : 'Masuk'}
          </AuthButton>
        </form>

        <p className="text-center text-sm leading-5 text-slate-500">
          Daftar sebagai{' '}
          <a
            className="text-[#1e40af] hover:underline"
            href="/register/student"
          >
            mahasiswa
          </a>{' '}
          atau{' '}
          <a className="text-[#1e40af] hover:underline" href="/register/seller">
            penjual
          </a>{' '}
          sekarang
        </p>
      </div>
    </AuthShell>
  )
}
