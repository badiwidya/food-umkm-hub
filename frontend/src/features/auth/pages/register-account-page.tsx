import { Lock, Mail, Phone, User } from 'lucide-react'

import { AuthButton } from '../components/auth-button'
import { AuthPasswordField, AuthTextField } from '../components/auth-field'
import { AuthShell } from '../components/auth-shell'
import { useRegisterAccountForm } from '../hooks/use-register-account-form'
import type { RegisterRole } from '../lib/register-role'

type RegisterAccountPageProps = {
  errorMessage?: string
  role: RegisterRole
}

export function RegisterAccountPage({
  errorMessage,
  role,
}: RegisterAccountPageProps) {
  const emailPlaceholder =
    role === 'student' ? 'mahasiswa@apps.ipb.ac.id' : 'penjual@email.com'
  const { form, onSubmit } = useRegisterAccountForm({ role })
  const errors = form.formState.errors

  return (
    <AuthShell subtitle="Bergabung dengan IPB Food Hub" title="Buat Akun Baru">
      <div className="space-y-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          {errorMessage ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
              {errorMessage}
            </p>
          ) : null}
          <AuthTextField
            autoComplete="name"
            icon={<User aria-hidden="true" className="size-5" />}
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            required
            type="text"
            {...form.register('fullName')}
          />
          {errors.fullName?.message ? (
            <p className="text-sm leading-5 text-red-600">
              {errors.fullName.message}
            </p>
          ) : null}
          <AuthTextField
            autoComplete="email"
            icon={<Mail aria-hidden="true" className="size-5" />}
            label="Email"
            placeholder={emailPlaceholder}
            required
            type="email"
            {...form.register('email')}
          />
          {errors.email?.message ? (
            <p className="text-sm leading-5 text-red-600">
              {errors.email.message}
            </p>
          ) : null}
          <AuthTextField
            autoComplete="tel"
            icon={<Phone aria-hidden="true" className="size-5" />}
            label="Nomor Telepon"
            placeholder="08xxxxxxxxxx"
            required
            type="tel"
            {...form.register('phoneNumber')}
          />
          {errors.phoneNumber?.message ? (
            <p className="text-sm leading-5 text-red-600">
              {errors.phoneNumber.message}
            </p>
          ) : null}
          <AuthPasswordField
            autoComplete="new-password"
            icon={<Lock aria-hidden="true" className="size-5" />}
            label="Password"
            placeholder="Minimal 8 karakter"
            required
            {...form.register('password')}
          />
          {errors.password?.message ? (
            <p className="text-sm leading-5 text-red-600">
              {errors.password.message}
            </p>
          ) : null}
          <AuthPasswordField
            autoComplete="new-password"
            icon={<Lock aria-hidden="true" className="size-5" />}
            label="Konfirmasi Password"
            placeholder="Ulangi password"
            required
            {...form.register('confirmPassword')}
          />
          {errors.confirmPassword?.message ? (
            <p className="text-sm leading-5 text-red-600">
              {errors.confirmPassword.message}
            </p>
          ) : null}
          <AuthButton type="submit">Daftar</AuthButton>
        </form>

        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          Kolom bertanda <span className="font-medium text-red-600">*</span>{' '}
          wajib diisi. Password minimal 8 karakter dan konfirmasi password harus
          sama.
        </p>

        <p className="text-center text-sm leading-5 text-slate-500">
          Sudah punya akun?{' '}
          <a className="text-[#1e40af] hover:underline" href="/login">
            Masuk sekarang
          </a>
        </p>
      </div>
    </AuthShell>
  )
}
