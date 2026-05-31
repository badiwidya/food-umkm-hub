import { useState } from 'react'

import type { SellerProduct } from '../types'

type ProductFormProps = {
  initialValue?: SellerProduct | null
  onCancel: () => void
  onSubmit: (product: SellerProduct) => void
}

export function ProductForm({
  initialValue,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [description, setDescription] = useState(initialValue?.description ?? '')
  const [category, setCategory] = useState(initialValue?.category ?? '')
  const [price, setPrice] = useState(String(initialValue?.price ?? ''))
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    String(initialValue?.estimatedMinutes ?? 10),
  )
  const [isAvailable, setIsAvailable] = useState(
    initialValue?.isAvailable ?? true,
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      id: initialValue?.id ?? `PRD-${Date.now()}`,
      name,
      description,
      category,
      price: Number(price),
      estimatedMinutes: Number(estimatedMinutes),
      isAvailable,
      isActive: initialValue?.isActive ?? true,
      imageUrl: initialValue?.imageUrl ?? null,
    })
  }

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h2 className="text-base font-semibold text-slate-900">
        {initialValue ? 'Edit Produk' : 'Tambah Produk'}
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Nama produk">
          <input
            className="input-seller"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </Field>

        <Field label="Kategori">
          <input
            className="input-seller"
            onChange={(event) => setCategory(event.target.value)}
            required
            value={category}
          />
        </Field>

        <Field label="Harga">
          <input
            className="input-seller"
            min="0"
            onChange={(event) => setPrice(event.target.value)}
            required
            type="number"
            value={price}
          />
        </Field>

        <Field label="Estimasi pembuatan / menit">
          <input
            className="input-seller"
            min="1"
            onChange={(event) => setEstimatedMinutes(event.target.value)}
            required
            type="number"
            value={estimatedMinutes}
          />
        </Field>
      </div>

      <Field label="Deskripsi">
        <textarea
          className="input-seller min-h-24"
          onChange={(event) => setDescription(event.target.value)}
          required
          value={description}
        />
      </Field>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
        <input
          checked={isAvailable}
          className="size-4 accent-[#006B3F]"
          onChange={(event) => setIsAvailable(event.target.checked)}
          type="checkbox"
        />
        Produk tersedia
      </label>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={onCancel}
          type="button"
        >
          Batal
        </button>
        <button
          className="h-11 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white hover:bg-[#004D2E]"
          type="submit"
        >
          Simpan Produk
        </button>
      </div>
    </form>
  )
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}