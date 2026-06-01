import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Camera, Mail, Phone, UserRound } from 'lucide-react'
import { useId } from 'react'

import type { UserDetailResponse } from '../../../client'
import { getMeUsersMeGetOptions } from '../../../client/@tanstack/react-query.gen'
import { SellerProfileFormField } from './seller-profile-form-field'
import { SellerProfilePageHeader } from './seller-profile-page-header'
import { useEditSellerAccountProfileForm } from './use-edit-seller-account-profile-form'

export function EditSellerAccountProfilePage() {
  const accountQuery = useQuery(getMeUsersMeGetOptions())
  const account = accountQuery.data

  if (accountQuery.isPending) {
    return <EditSellerAccountProfileSkeleton />
  }

  if (accountQuery.isError || !account) {
    return (
      <>
        <SellerProfilePageHeader title="Edit Akun" />
        <div className="px-4 py-8">
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center text-sm leading-5 text-red-700">
            Data akun gagal dimuat. Coba muat ulang halaman.
          </p>
        </div>
      </>
    )
  }

  return <EditSellerAccountProfileForm key={account.id} account={account} />
}

function EditSellerAccountProfileForm({
  account,
}: {
  account: UserDetailResponse
}) {
  const fileInputId = useId()
  const {
    avatarError,
    avatarFile,
    avatarPreviewUrl,
    form,
    formError,
    formSuccess,
    isPending,
    onSubmit,
    setAvatar,
  } = useEditSellerAccountProfileForm({ account })
  const errors = form.formState.errors
  const avatarUrl = avatarPreviewUrl ?? account.avatarUrl

  return (
    <>
      <SellerProfilePageHeader title="Edit Akun" />
      <form className="pb-32" onSubmit={onSubmit}>
        <div className="flex-1 space-y-6 px-4 py-6">
          <div className="text-center">
            <div className="relative mx-auto size-24">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-slate-400 shadow-lg">
                {avatarUrl ? (
                  <img
                    alt={account.fullName}
                    className="size-full object-cover"
                    src={avatarUrl}
                  />
                ) : (
                  <UserRound aria-hidden="true" className="size-10" />
                )}
              </div>
              <label
                className="absolute bottom-0 right-0 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#1e40af] text-white shadow-md transition hover:bg-[#1d3a9c]"
                htmlFor={fileInputId}
              >
                <Camera aria-hidden="true" className="size-4" />
                <span className="sr-only">Ubah foto profil</span>
              </label>
              <input
                accept="image/jpeg,image/png"
                className="sr-only"
                id={fileInputId}
                onChange={(event) => {
                  setAvatar(event.target.files?.[0] ?? null)
                  event.currentTarget.value = ''
                }}
                type="file"
              />
            </div>
            <p className="mt-4 text-xs leading-4 text-slate-500">
              Klik ikon kamera untuk mengubah foto
            </p>
            <p className="text-xs leading-4 text-slate-500">
              Max 2MB (JPG, PNG)
            </p>
            {avatarFile ? (
              <p className="mt-1 truncate text-xs leading-4 text-slate-500">
                {avatarFile.name}
              </p>
            ) : null}
            {avatarError ? (
              <p className="mt-2 text-sm leading-5 text-red-600">
                {avatarError}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
              {formError}
            </p>
          ) : null}
          {formSuccess ? (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm leading-5 text-[#1e40af]">
              {formSuccess}
            </p>
          ) : null}

          <SellerProfileFormField
            error={errors.fullName?.message}
            icon={<UserRound aria-hidden="true" className="size-5" />}
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            type="text"
            {...form.register('fullName')}
          />
          <SellerProfileFormField
            error={errors.email?.message}
            helperText="Perubahan email perlu diverifikasi dari inbox email baru"
            icon={<Mail aria-hidden="true" className="size-5" />}
            label="Email"
            placeholder="nama@email.com"
            type="email"
            {...form.register('email')}
          />
          <SellerProfileFormField
            error={errors.phoneNumber?.message}
            helperText="Format: +628xxxxxxxxxx"
            icon={<Phone aria-hidden="true" className="size-5" />}
            inputMode="tel"
            label="Nomor Telepon"
            placeholder="+628123456789"
            type="tel"
            {...form.register('phoneNumber')}
          />

          <section className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-4">
            <h2 className="text-sm font-medium leading-5 text-slate-800">
              Informasi Penting:
            </h2>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
              <li>Pastikan data akun yang diisi sudah benar</li>
              <li>Email akan digunakan untuk notifikasi pesanan</li>
              <li>Nomor telepon akan digunakan untuk konfirmasi</li>
            </ul>
          </section>
        </div>

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

function EditSellerAccountProfileSkeleton() {
  return (
    <>
      <SellerProfilePageHeader title="Edit Akun" />
      <div className="space-y-6 px-4 py-6">
        <div className="mx-auto size-24 animate-pulse rounded-full bg-slate-100" />
        <div className="space-y-4">
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    </>
  )
}
