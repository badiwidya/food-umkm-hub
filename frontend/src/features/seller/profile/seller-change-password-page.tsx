import { Link } from '@tanstack/react-router'
import { KeyRound, Lock } from 'lucide-react'

import { SellerProfileFormField } from './seller-profile-form-field'
import { SellerProfilePageHeader } from './seller-profile-page-header'
import { useSellerChangePasswordForm } from './use-seller-change-password-form'

export function SellerChangePasswordPage() {
  const { form, formError, isPending, onSubmit } = useSellerChangePasswordForm()
  const errors = form.formState.errors

  return (
    <>
      <SellerProfilePageHeader title="Ganti Password" />
      <form className="space-y-6 px-4 py-6 pb-32" onSubmit={onSubmit}>
        {formError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
            {formError}
          </p>
        ) : null}

        <SellerProfileFormField
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          icon={<Lock aria-hidden="true" className="size-5" />}
          label="Password Saat Ini"
          placeholder="Masukkan password saat ini"
          type="password"
          {...form.register('currentPassword')}
        />
        <SellerProfileFormField
          autoComplete="new-password"
          error={errors.newPassword?.message}
          helperText="Minimal 8 karakter"
          icon={<KeyRound aria-hidden="true" className="size-5" />}
          label="Password Baru"
          placeholder="Masukkan password baru"
          type="password"
          {...form.register('newPassword')}
        />
        <SellerProfileFormField
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          icon={<KeyRound aria-hidden="true" className="size-5" />}
          label="Konfirmasi Password Baru"
          placeholder="Ulangi password baru"
          type="password"
          {...form.register('confirmPassword')}
        />

        <footer className="fixed inset-x-0 bottom-16 z-20 mx-auto w-full max-w-sm border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-8px_20px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-2 gap-3">
            <Link
              className="flex min-h-12 items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-base font-medium leading-6 text-slate-700 transition hover:bg-slate-50"
              to="/seller/profile"
            >
              Batal
            </Link>
            <button
              className="min-h-12 rounded-lg bg-[#1e40af] px-4 py-3 text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </footer>
      </form>
    </>
  )
}
