import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Building2,
  ChevronRight,
  GraduationCap,
  IdCard,
  LogOut,
  Mail,
  Phone,
  Shield,
  UserRound,
} from 'lucide-react'

import { getMeStudentsMeGetOptions } from '../../../client/@tanstack/react-query.gen'
import { useAuthStore } from '../../../stores/auth-store'
import { StudentAppShell } from '../layout'
import { ProfileInfoRow } from './profile-info-row'

type ProfilePageProps = {
  showEmailChangeNotice?: boolean
}

export function ProfilePage({
  showEmailChangeNotice = false,
}: ProfilePageProps) {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const studentQuery = useQuery(getMeStudentsMeGetOptions())
  const student = studentQuery.data

  function handleLogout() {
    clearAuth()
    void navigate({ to: '/login' })
  }

  return (
    <StudentAppShell>
      {studentQuery.isPending ? <ProfileSkeleton /> : null}

      {studentQuery.isError ? (
        <div className="px-4 py-8">
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center text-sm leading-5 text-red-700">
            Profil gagal dimuat. Coba muat ulang halaman.
          </p>
        </div>
      ) : null}

      {student ? (
        <>
          <section className="bg-[#1e40af] px-4 pb-8 pt-7 text-white">
            <h1 className="text-xl font-medium leading-7">Profil</h1>
            <div className="mt-7 flex items-center gap-4">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[#1e40af]">
                {student.avatarUrl ? (
                  <img
                    alt={student.fullName}
                    className="size-full object-cover"
                    src={student.avatarUrl}
                  />
                ) : (
                  <UserRound aria-hidden="true" className="size-10" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-medium leading-7">
                  {student.fullName}
                </h2>
                <p className="mt-1 truncate text-sm leading-5 text-white/80">
                  Mahasiswa Food & UMKM Hub
                </p>
              </div>
            </div>
          </section>

          <div className="space-y-4 px-4 py-4">
            {showEmailChangeNotice ? (
              <p className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-5 text-[#1e40af]">
                Silakan periksa inbox email baru Anda untuk menyelesaikan
                perubahan email
              </p>
            ) : null}

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <h2 className="px-4 py-4 text-sm font-medium leading-5 text-slate-500">
                Informasi Akun
              </h2>
              <ProfileInfoRow
                icon={<UserRound aria-hidden="true" className="size-5" />}
                label="Nama Lengkap"
                value={student.fullName}
              />
              <ProfileInfoRow
                icon={<Mail aria-hidden="true" className="size-5" />}
                label="Email"
                value={student.email}
              />
              <ProfileInfoRow
                icon={<Phone aria-hidden="true" className="size-5" />}
                label="Nomor Telepon"
                value={student.phoneNumber}
              />
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <h2 className="px-4 py-4 text-sm font-medium leading-5 text-slate-500">
                Informasi Akademik
              </h2>
              <ProfileInfoRow
                icon={<IdCard aria-hidden="true" className="size-5" />}
                label="NIM"
                value={student.nim}
              />
              <ProfileInfoRow
                icon={<Building2 aria-hidden="true" className="size-5" />}
                label="Fakultas"
                value={student.faculty}
              />
              <ProfileInfoRow
                icon={<GraduationCap aria-hidden="true" className="size-5" />}
                label="Departemen"
                value={student.department}
              />
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <h2 className="px-4 py-4 text-sm font-medium leading-5 text-slate-500">
                Pengaturan
              </h2>
              <Link
                className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 transition hover:bg-slate-50"
                to="/profile/edit"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e40af]">
                    <UserRound aria-hidden="true" className="size-5" />
                  </span>
                  <span className="truncate text-sm font-medium leading-5 text-slate-800">
                    Edit Profil
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-5 shrink-0 text-slate-500"
                />
              </Link>
              <Link
                className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50"
                to="/profile/change-password"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e40af]">
                    <Shield aria-hidden="true" className="size-5" />
                  </span>
                  <span className="truncate text-sm font-medium leading-5 text-slate-800">
                    Ganti Password
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-5 shrink-0 text-slate-500"
                />
              </Link>
            </section>

            <button
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-base font-medium leading-6 text-white transition hover:bg-red-700"
              onClick={handleLogout}
              type="button"
            >
              <LogOut aria-hidden="true" className="size-5" />
              Keluar
            </button>

            <footer className="space-y-1 py-2 text-center text-xs leading-4 text-slate-500">
              <p>Food & UMKM Hub v1.0.0</p>
              <p>© 2026 IPB University</p>
            </footer>
          </div>
        </>
      ) : null}
    </StudentAppShell>
  )
}

function ProfileSkeleton() {
  return (
    <>
      <section className="bg-[#1e40af] px-4 pb-8 pt-7">
        <div className="h-7 w-20 animate-pulse rounded bg-white/20" />
        <div className="mt-7 flex items-center gap-4">
          <div className="size-20 animate-pulse rounded-full bg-white/30" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-white/30" />
            <div className="h-4 w-48 animate-pulse rounded bg-white/20" />
          </div>
        </div>
      </section>
      <div className="space-y-4 px-4 py-4">
        <div className="h-60 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-48 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </>
  )
}
