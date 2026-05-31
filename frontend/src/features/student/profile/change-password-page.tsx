import { KeyRound, Lock } from 'lucide-react'

import { ProfileFormField } from './profile-form-field'
import { ProfilePageHeader } from './profile-page-header'
import { useChangePasswordForm } from './use-change-password-form'

export function ChangePasswordPage() {
  const { form, formError, isPending, onSubmit } = useChangePasswordForm()
  const errors = form.formState.errors

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-sm bg-white shadow-sm">
        <ProfilePageHeader title="Ganti Password" />
        <form className="space-y-6 px-4 py-6" onSubmit={onSubmit}>
          {formError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
              {formError}
            </p>
          ) : null}

          <ProfileFormField
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            icon={<Lock aria-hidden="true" className="size-5" />}
            label="Password Saat Ini"
            placeholder="Masukkan password saat ini"
            type="password"
            {...form.register('currentPassword')}
          />
          <ProfileFormField
            autoComplete="new-password"
            error={errors.newPassword?.message}
            helperText="Minimal 8 karakter"
            icon={<KeyRound aria-hidden="true" className="size-5" />}
            label="Password Baru"
            placeholder="Masukkan password baru"
            type="password"
            {...form.register('newPassword')}
          />
          <ProfileFormField
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            icon={<KeyRound aria-hidden="true" className="size-5" />}
            label="Konfirmasi Password Baru"
            placeholder="Ulangi password baru"
            type="password"
            {...form.register('confirmPassword')}
          />

          <button
            className="min-h-12 w-full rounded-lg bg-[#1e40af] px-4 py-3 text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </main>
  )
}
