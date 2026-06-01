import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  ChevronRight,
  Clock3,
  ImageIcon,
  LogOut,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Shield,
  Store,
  UserRound,
} from 'lucide-react'
import type { ReactNode } from 'react'

import {
  getMeStoresMeGetOptions,
  getMeUsersMeGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import { useAuthStore } from '../../../stores/auth-store'

export function SellerProfilePage() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const storeQuery = useQuery(getMeStoresMeGetOptions())
  const accountQuery = useQuery(getMeUsersMeGetOptions())
  const store = storeQuery.data
  const account = accountQuery.data
  const isPending = storeQuery.isPending || accountQuery.isPending
  const isError = storeQuery.isError || accountQuery.isError
  const title = store?.name ?? 'Profil Penjual'
  const subtitle = account?.fullName ?? 'Penjual IPB Food Hub'

  function handleLogout() {
    clearAuth()
    void navigate({ to: '/login' })
  }

  if (isPending) {
    return <SellerProfileSkeleton />
  }

  if (isError || !store || !account) {
    return (
      <div className="px-4 py-8">
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center text-sm leading-5 text-red-700">
          Profil penjual gagal dimuat. Coba muat ulang halaman.
        </p>
      </div>
    )
  }

  return (
    <>
      <section className="bg-[#1e40af] px-4 pb-8 pt-7 text-white">
        <h1 className="text-xl font-medium leading-7">Profil</h1>
        <div className="mt-7 flex items-center gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[#1e40af]">
            {store.photoUrl ? (
              <img
                alt={store.name}
                className="size-full object-cover"
                src={store.photoUrl}
              />
            ) : (
              <Store aria-hidden="true" className="size-10" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-medium leading-7">{title}</h2>
            <p className="mt-1 truncate text-sm leading-5 text-white/80">
              {subtitle}
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-4 px-4 py-4">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <h2 className="px-4 py-4 text-sm font-medium leading-5 text-slate-500">
            Profil Toko
          </h2>
          <ProfileInfoRow
            icon={<ImageIcon aria-hidden="true" className="size-5" />}
            label="Foto Toko"
            value={store.photoUrl ? 'Tersedia' : 'Belum tersedia'}
          />
          <ProfileInfoRow
            icon={<Store aria-hidden="true" className="size-5" />}
            label="Nama Toko"
            value={store.name}
          />
          <ProfileInfoRow
            icon={<Store aria-hidden="true" className="size-5" />}
            label="Deskripsi"
            value={store.description}
          />
          <ProfileInfoRow
            icon={<MapPin aria-hidden="true" className="size-5" />}
            label="Alamat"
            value={store.address}
          />
          <ProfileInfoRow
            icon={<QrCode aria-hidden="true" className="size-5" />}
            label="QRIS"
            media={
              store.qrisImageUrl ? (
                <img
                  alt="QRIS toko"
                  className="mt-2 aspect-square w-20 rounded-md border border-slate-200 object-cover"
                  src={store.qrisImageUrl}
                />
              ) : null
            }
            value={store.qrisImageUrl ? 'QRIS tersedia' : 'QRIS belum tersedia'}
          />
          <ProfileInfoRow
            icon={<Clock3 aria-hidden="true" className="size-5" />}
            label="Status Operasional"
            value={store.isOpen ? 'Buka' : 'Tutup'}
          />
          <ProfileActionRow
            disabled
            icon={<Store aria-hidden="true" className="size-5" />}
            label="Edit Profil Toko"
          />
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <h2 className="px-4 py-4 text-sm font-medium leading-5 text-slate-500">
            Informasi Akun
          </h2>
          <ProfileInfoRow
            icon={<UserRound aria-hidden="true" className="size-5" />}
            label="Nama Lengkap"
            value={account.fullName}
          />
          <ProfileInfoRow
            icon={<Mail aria-hidden="true" className="size-5" />}
            label="Email"
            value={account.email}
          />
          <ProfileInfoRow
            icon={<Phone aria-hidden="true" className="size-5" />}
            label="Nomor Telepon"
            value={account.phoneNumber}
          />
          <ProfileActionRow
            disabled
            icon={<UserRound aria-hidden="true" className="size-5" />}
            label="Edit Akun"
          />
          <ProfileActionRow
            disabled
            icon={<Shield aria-hidden="true" className="size-5" />}
            label="Ganti Password"
          />
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <h2 className="px-4 py-4 text-sm font-medium leading-5 text-slate-500">
            Pengaturan
          </h2>
          <button
            className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
            onClick={handleLogout}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <LogOut aria-hidden="true" className="size-5" />
              </span>
              <span className="truncate text-sm font-medium leading-5 text-red-600">
                Keluar
              </span>
            </span>
          </button>
        </section>

        <footer className="space-y-1 py-2 text-center text-xs leading-4 text-slate-500">
          <p>IPB Food Hub v1.0.0</p>
          <p>© 2026 IPB University</p>
        </footer>
      </div>
    </>
  )
}

type ProfileInfoRowProps = {
  icon: ReactNode
  label: string
  media?: ReactNode
  value: string
}

function ProfileInfoRow({ icon, label, media, value }: ProfileInfoRowProps) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e40af]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-4 text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm leading-5 text-slate-800">
          {value || '-'}
        </p>
        {media}
      </div>
    </div>
  )
}

type ProfileActionRowProps = {
  disabled?: boolean
  icon: ReactNode
  label: string
}

function ProfileActionRow({
  disabled = false,
  icon,
  label,
}: ProfileActionRowProps) {
  return (
    <button
      aria-disabled={disabled}
      className="flex min-h-16 w-full items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 text-left transition last:border-b-0 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      type="button"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e40af]">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium leading-5 text-slate-800">
            {label}
          </span>
          {disabled ? (
            <span className="mt-1 block text-xs leading-4 text-slate-500">
              Segera hadir
            </span>
          ) : null}
        </span>
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-5 shrink-0 text-slate-500"
      />
    </button>
  )
}

function SellerProfileSkeleton() {
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
        <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-72 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </>
  )
}
