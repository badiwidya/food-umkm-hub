import { Lock, Mail, Phone, User } from 'lucide-react'

import { AuthButton } from '../components/auth-button'
import { AuthPasswordField, AuthTextField } from '../components/auth-field'
import { AuthShell } from '../components/auth-shell'
import type { RegisterRole } from '../lib/register-role'

type RegisterAccountPageProps = {
  role: RegisterRole
}

export function RegisterAccountPage({ role }: RegisterAccountPageProps) {
  const emailPlaceholder =
    role === 'student' ? 'mahasiswa@apps.ipb.ac.id' : 'penjual@email.com'

  return (
    <AuthShell subtitle="Bergabung dengan IPB Food Hub" title="Buat Akun Baru">
      <div className="space-y-6">
        <div className="space-y-4">
          <AuthTextField
            icon={<User aria-hidden="true" className="size-5" />}
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            required
            type="text"
          />
          <AuthTextField
            icon={<Mail aria-hidden="true" className="size-5" />}
            label="Email"
            placeholder={emailPlaceholder}
            required
            type="email"
          />
          <AuthTextField
            icon={<Phone aria-hidden="true" className="size-5" />}
            label="Nomor Telepon"
            placeholder="08xxxxxxxxxx"
            required
            type="tel"
          />
          <AuthPasswordField
            icon={<Lock aria-hidden="true" className="size-5" />}
            label="Password"
            placeholder="Minimal 8 karakter"
            required
          />
          <AuthPasswordField
            icon={<Lock aria-hidden="true" className="size-5" />}
            label="Konfirmasi Password"
            placeholder="Ulangi password"
            required
          />
          <AuthButton>Daftar</AuthButton>
        </div>

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
