import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Camera,
  GraduationCap,
  IdCard,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react'
import { useId } from 'react'
import type { ReactNode } from 'react'

import type { StudentResponse } from '../../../client'
import { getMeStudentsMeGetOptions } from '../../../client/@tanstack/react-query.gen'
import { ProfileFormField } from './profile-form-field'
import { ProfilePageHeader } from './profile-page-header'
import { useEditProfileForm } from './use-edit-profile-form'

export function EditProfilePage() {
  const studentQuery = useQuery(getMeStudentsMeGetOptions())
  const student = studentQuery.data

  if (studentQuery.isPending) {
    return <EditProfileSkeleton />
  }

  if (studentQuery.isError || !student) {
    return (
      <ProfileScreenFrame>
        <ProfilePageHeader title="Edit Profil" />
        <div className="px-4 py-8">
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center text-sm leading-5 text-red-700">
            Data profil gagal dimuat. Coba muat ulang halaman.
          </p>
        </div>
      </ProfileScreenFrame>
    )
  }

  return <EditProfileForm key={student.id} student={student} />
}

function EditProfileForm({ student }: { student: StudentResponse }) {
  const fileInputId = useId()
  const {
    avatarError,
    avatarPreviewUrl,
    form,
    formError,
    formSuccess,
    isPending,
    onSubmit,
    setAvatar,
  } = useEditProfileForm({ student })
  const errors = form.formState.errors
  const avatarUrl = avatarPreviewUrl ?? student.avatarUrl

  return (
    <ProfileScreenFrame>
      <ProfilePageHeader title="Edit Profil" />
      <form
        className="flex min-h-[calc(100vh-56px)] flex-col"
        onSubmit={onSubmit}
      >
        <div className="flex-1 space-y-6 px-4 py-6">
          <div className="text-center">
            <div className="relative mx-auto size-24">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-slate-400 shadow-lg">
                {avatarUrl ? (
                  <img
                    alt={student.fullName}
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

          <ProfileFormField
            error={errors.fullName?.message}
            icon={<UserRound aria-hidden="true" className="size-5" />}
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            type="text"
            {...form.register('fullName')}
          />
          <ProfileFormField
            error={errors.email?.message}
            helperText="Harus menggunakan email IPB"
            icon={<Mail aria-hidden="true" className="size-5" />}
            label="Email IPB"
            placeholder="nama@apps.ipb.ac.id"
            type="email"
            {...form.register('email')}
          />
          <ProfileFormField
            error={errors.phoneNumber?.message}
            helperText="Format: +628xxxxxxxxxx"
            icon={<Phone aria-hidden="true" className="size-5" />}
            inputMode="tel"
            label="Nomor Telepon"
            placeholder="+628123456789"
            type="tel"
            {...form.register('phoneNumber')}
          />
          <ProfileFormField
            error={errors.nim?.message}
            icon={<IdCard aria-hidden="true" className="size-5" />}
            label="NIM"
            placeholder="Masukkan NIM"
            type="text"
            {...form.register('nim')}
          />
          <ProfileFormField
            error={errors.faculty?.message}
            icon={<Building2 aria-hidden="true" className="size-5" />}
            label="Fakultas"
            placeholder="Masukkan fakultas"
            type="text"
            {...form.register('faculty')}
          />
          <ProfileFormField
            error={errors.department?.message}
            icon={<GraduationCap aria-hidden="true" className="size-5" />}
            label="Departemen / Program Studi"
            placeholder="Masukkan departemen"
            type="text"
            {...form.register('department')}
          />

          <section className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-4">
            <h2 className="text-sm font-medium leading-5 text-slate-800">
              Informasi Penting:
            </h2>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
              <li>Pastikan data yang diisi sudah benar</li>
              <li>Email akan digunakan untuk notifikasi pesanan</li>
              <li>Nomor telepon akan digunakan untuk konfirmasi</li>
              <li>Perubahan data akan langsung tersimpan</li>
            </ul>
          </section>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-8px_20px_rgba(15,23,42,0.08)]">
          <button
            className="min-h-12 w-full rounded-lg bg-[#1e40af] px-4 py-3 text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </ProfileScreenFrame>
  )
}

function ProfileScreenFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-sm bg-white shadow-sm">
        {children}
      </div>
    </main>
  )
}

function EditProfileSkeleton() {
  return (
    <ProfileScreenFrame>
      <ProfilePageHeader title="Edit Profil" />
      <div className="space-y-6 px-4 py-6">
        <div className="mx-auto size-24 animate-pulse rounded-full bg-slate-100" />
        <div className="space-y-4">
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    </ProfileScreenFrame>
  )
}
