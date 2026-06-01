import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Camera, FileText, LinkIcon, MapPin, QrCode, Store } from 'lucide-react'
import { useId } from 'react'

import type { StoreDetailResponse } from '../../../client'
import { getMeStoresMeGetOptions } from '../../../client/@tanstack/react-query.gen'
import {
  SellerProfileFormField,
  SellerProfileTextareaField,
} from './seller-profile-form-field'
import { SellerProfilePageHeader } from './seller-profile-page-header'
import { useEditStoreProfileForm } from './use-edit-store-profile-form'

export function EditStoreProfilePage() {
  const storeQuery = useQuery(getMeStoresMeGetOptions())
  const store = storeQuery.data

  if (storeQuery.isPending) {
    return <EditStoreProfileSkeleton />
  }

  if (storeQuery.isError || !store) {
    return (
      <>
        <SellerProfilePageHeader title="Edit Profil Toko" />
        <div className="px-4 py-8">
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center text-sm leading-5 text-red-700">
            Data profil toko gagal dimuat. Coba muat ulang halaman.
          </p>
        </div>
      </>
    )
  }

  return <EditStoreProfileForm key={store.id} store={store} />
}

function EditStoreProfileForm({ store }: { store: StoreDetailResponse }) {
  const storePhotoInputId = useId()
  const qrisInputId = useId()
  const {
    form,
    formError,
    formSuccess,
    isPending,
    onSubmit,
    qrisError,
    qrisFile,
    qrisPreviewUrl,
    setQrisImage,
    setStorePhoto,
    storePhotoError,
    storePhotoFile,
    storePhotoPreviewUrl,
  } = useEditStoreProfileForm({ store })
  const errors = form.formState.errors
  const displayedStorePhotoUrl = storePhotoPreviewUrl ?? store.photoUrl
  const displayedQrisUrl = qrisPreviewUrl ?? store.qrisImageUrl

  return (
    <>
      <SellerProfilePageHeader title="Edit Profil Toko" />
      <form className="pb-32" onSubmit={onSubmit}>
        <section className="space-y-5 px-4 py-5">
          <ImageUploadCard
            description="JPG, PNG max 5MB"
            error={storePhotoError}
            fileInputId={storePhotoInputId}
            fileName={storePhotoFile?.name ?? 'Foto toko saat ini'}
            imageAlt={store.name}
            imageUrl={displayedStorePhotoUrl}
            label="Foto Toko"
            onFileChange={setStorePhoto}
          />

          <ImageUploadCard
            description="JPG, PNG max 5MB"
            error={qrisError}
            fileInputId={qrisInputId}
            fileName={qrisFile?.name ?? 'QRIS toko saat ini'}
            imageAlt="QRIS toko"
            imageClassName="object-contain"
            imageUrl={displayedQrisUrl}
            label="QRIS"
            onFileChange={setQrisImage}
          />

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

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <SellerProfileFormField
              error={errors.name?.message}
              icon={<Store aria-hidden="true" className="size-5" />}
              label="Nama Toko"
              placeholder="Masukkan nama toko"
              type="text"
              {...form.register('name')}
            />
            <SellerProfileTextareaField
              error={errors.description?.message}
              icon={<FileText aria-hidden="true" className="size-5" />}
              label="Deskripsi"
              placeholder="Tambahkan deskripsi toko"
              rows={4}
              {...form.register('description')}
            />
            <SellerProfileTextareaField
              error={errors.address?.message}
              icon={<MapPin aria-hidden="true" className="size-5" />}
              label="Alamat"
              placeholder="Masukkan alamat toko"
              rows={3}
              {...form.register('address')}
            />
            <SellerProfileFormField
              error={errors.mapsLink?.message}
              helperText="Opsional. Kosongkan untuk menghapus link maps."
              icon={<LinkIcon aria-hidden="true" className="size-5" />}
              inputMode="url"
              label="Link Maps"
              placeholder="https://maps.google.com/..."
              type="text"
              {...form.register('mapsLink')}
            />
          </div>

          <section className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-4">
            <h2 className="text-sm font-medium leading-5 text-slate-800">
              Informasi Penting:
            </h2>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
              <li>Pastikan nama, alamat, dan deskripsi toko sudah benar</li>
              <li>
                QRIS akan digunakan mahasiswa saat memilih pembayaran QRIS
              </li>
              <li>Perubahan foto toko akan tampil di halaman toko</li>
            </ul>
          </section>
        </section>

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

type ImageUploadCardProps = {
  description: string
  error: string | null
  fileInputId: string
  fileName: string
  imageAlt: string
  imageClassName?: string
  imageUrl: string | null
  label: string
  onFileChange: (file: File | null) => void
}

function ImageUploadCard({
  description,
  error,
  fileInputId,
  fileName,
  imageAlt,
  imageClassName = 'object-cover',
  imageUrl,
  label,
  onFileChange,
}: ImageUploadCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium leading-5 text-slate-800">{label}</h2>
      <label
        className="mt-4 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center transition hover:border-blue-200 hover:bg-blue-50/40"
        htmlFor={fileInputId}
      >
        {imageUrl ? (
          <img
            alt={imageAlt}
            className={`size-full ${imageClassName}`}
            src={imageUrl}
          />
        ) : (
          <span className="flex flex-col items-center px-4">
            {label === 'QRIS' ? (
              <QrCode aria-hidden="true" className="size-12 text-slate-400" />
            ) : (
              <Camera aria-hidden="true" className="size-12 text-slate-400" />
            )}
            <span className="mt-3 text-sm font-medium leading-5 text-slate-500">
              Klik untuk upload {label.toLowerCase()}
            </span>
            <span className="mt-1 text-xs leading-4 text-slate-500">
              {description}
            </span>
          </span>
        )}
        <input
          accept="image/jpeg,image/png"
          className="sr-only"
          id={fileInputId}
          onChange={(event) => {
            onFileChange(event.target.files?.[0] ?? null)
            event.currentTarget.value = ''
          }}
          type="file"
        />
      </label>
      {imageUrl ? (
        <p className="mt-2 truncate text-xs leading-4 text-slate-500">
          {fileName}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm leading-5 text-red-600">{error}</p>
      ) : null}
    </div>
  )
}

function EditStoreProfileSkeleton() {
  return (
    <>
      <SellerProfilePageHeader title="Edit Profil Toko" />
      <section className="space-y-5 px-4 py-5">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 aspect-[4/3] animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 aspect-[4/3] animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </section>
    </>
  )
}
