import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Camera,
  FileText,
  PackagePlus,
  Tag,
  Utensils,
  Wallet,
} from 'lucide-react'
import { useId } from 'react'

import {
  ManagementFormField,
  ManagementSelectField,
  ManagementTextareaField,
} from '../../../components/common/management-form-field'
import type { ProductDetailResponse } from '../../../client'
import { useProductForm } from './use-product-form'

type ProductFormPageProps =
  | {
      mode: 'create'
    }
  | {
      mode: 'edit'
      product: ProductDetailResponse
    }

export function AddProductPage() {
  return <ProductFormPage mode="create" />
}

export function ProductFormPage(props: ProductFormPageProps) {
  const fileInputId = useId()
  const {
    existingPhotoUrl,
    form,
    formError,
    isPending,
    onSubmit,
    photoError,
    photoFile,
    photoPreviewUrl,
    setPhoto,
  } = useProductForm(
    props.mode === 'edit'
      ? {
          kind: 'edit',
          product: props.product,
        }
      : {
          kind: 'create',
        },
  )
  const errors = form.formState.errors
  const displayedPhotoUrl = photoPreviewUrl ?? existingPhotoUrl
  const isEditMode = props.mode === 'edit'

  return (
    <>
      <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
        <div className="flex items-center gap-3">
          <Link
            aria-label="Kembali ke produk"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            to="/seller/products"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-medium leading-7">
              {isEditMode ? 'Edit Produk' : 'Tambah Produk'}
            </h1>
            <p className="mt-1 truncate text-sm leading-5 text-white/80">
              {isEditMode
                ? 'Perbarui detail menu toko'
                : 'Lengkapi detail menu toko'}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <PackagePlus aria-hidden="true" className="size-6" />
          </div>
        </div>
      </header>

      <form className="pb-32" onSubmit={onSubmit}>
        <section className="space-y-5 px-4 py-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-medium leading-5 text-slate-800">
              Foto Produk
            </h2>
            <label
              className="mt-4 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center transition hover:border-blue-200 hover:bg-blue-50/40"
              htmlFor={fileInputId}
            >
              {displayedPhotoUrl ? (
                <img
                  alt={photoFile?.name ?? 'Foto produk'}
                  className="size-full object-cover"
                  src={displayedPhotoUrl}
                />
              ) : (
                <span className="flex flex-col items-center px-4">
                  <Camera
                    aria-hidden="true"
                    className="size-12 text-slate-400"
                  />
                  <span className="mt-3 text-sm font-medium leading-5 text-slate-500">
                    Klik untuk upload foto
                  </span>
                  <span className="mt-1 text-xs leading-4 text-slate-500">
                    JPG, PNG max 5MB
                  </span>
                </span>
              )}
              <input
                accept="image/jpeg,image/png"
                className="sr-only"
                id={fileInputId}
                onChange={(event) => {
                  setPhoto(event.target.files?.[0] ?? null)
                  event.currentTarget.value = ''
                }}
                type="file"
              />
            </label>
            {displayedPhotoUrl ? (
              <p className="mt-2 truncate text-xs leading-4 text-slate-500">
                {photoFile?.name ?? 'Foto produk saat ini'}
              </p>
            ) : null}
            {photoError ? (
              <p className="mt-2 text-sm leading-5 text-red-600">
                {photoError}
              </p>
            ) : null}
          </div>

          {formError ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm leading-5 text-red-700">{formError}</p>
            </div>
          ) : null}

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <ManagementFormField
              error={errors.name?.message}
              icon={<Utensils aria-hidden="true" className="size-5" />}
              label="Nama Produk"
              placeholder="Contoh: Nasi Ayam Geprek"
              type="text"
              {...form.register('name')}
            />
            <ManagementFormField
              error={errors.price?.message}
              icon={<Wallet aria-hidden="true" className="size-5" />}
              inputMode="numeric"
              label="Harga"
              placeholder="Contoh: 15000"
              type="number"
              {...form.register('price')}
            />
            <ManagementSelectField
              error={errors.category?.message}
              icon={<Tag aria-hidden="true" className="size-5" />}
              label="Kategori"
              {...form.register('category')}
            >
              <option value="food">Makanan</option>
              <option value="drink">Minuman</option>
              <option value="snack">Camilan</option>
              <option value="other">Lainnya</option>
            </ManagementSelectField>
            <ManagementTextareaField
              error={errors.description?.message}
              icon={<FileText aria-hidden="true" className="size-5" />}
              label="Deskripsi"
              placeholder="Tambahkan deskripsi produk"
              rows={4}
              {...form.register('description')}
            />
          </div>
        </section>

        <footer className="fixed inset-x-0 bottom-16 z-20 mx-auto w-full max-w-sm border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-8px_20px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-2 gap-3">
            <Link
              className="flex min-h-12 items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-base font-medium leading-6 text-slate-700 transition hover:bg-slate-50"
              to="/seller/products"
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
