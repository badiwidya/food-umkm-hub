import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import { StatusBadge } from '../components/status-badge'
import { getSellerProfile } from '../services/seller-service'
import type { SellerStoreProfile } from '../types'

export function SellerProfilePage() {
  const profileQuery = useQuery({
    queryFn: getSellerProfile,
    queryKey: ['seller-profile'],
  })

  const [form, setForm] = useState<SellerStoreProfile | null>(null)

  useEffect(() => {
    if (profileQuery.data) {
      setForm(profileQuery.data)
    }
  }, [profileQuery.data])

  if (profileQuery.isPending || !form) {
    return (
      <>
        <PageHeader
          description="Kelola informasi toko dan status operasional."
          title="Profil UMKM"
        />
        <LoadingState />
      </>
    )
  }

  return (
    <>
      <PageHeader
        description="Kelola informasi UMKM, jam operasional, dan status verifikasi."
        title="Profil UMKM"
        action={<StatusBadge status={form.verificationStatus} />}
      />

      <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-[#F8FAF7] p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Status toko
            </p>
            <p className="text-sm text-slate-500">
              Atur apakah toko sedang menerima pesanan.
            </p>
          </div>

          <button
            className={[
              'rounded-full px-4 py-2 text-sm font-medium',
              form.isOpen
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700',
            ].join(' ')}
            onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
            type="button"
          >
            {form.isOpen ? 'Buka' : 'Tutup'}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama UMKM">
            <input
              className="input-seller"
              onChange={(event) =>
                setForm({ ...form, storeName: event.target.value })
              }
              value={form.storeName}
            />
          </Field>

          <Field label="Nama pemilik">
            <input
              className="input-seller"
              onChange={(event) =>
                setForm({ ...form, ownerName: event.target.value })
              }
              value={form.ownerName}
            />
          </Field>

          <Field label="Jam buka">
            <input
              className="input-seller"
              onChange={(event) =>
                setForm({ ...form, openTime: event.target.value })
              }
              type="time"
              value={form.openTime}
            />
          </Field>

          <Field label="Jam tutup">
            <input
              className="input-seller"
              onChange={(event) =>
                setForm({ ...form, closeTime: event.target.value })
              }
              type="time"
              value={form.closeTime}
            />
          </Field>
        </div>

        <Field label="Lokasi">
          <input
            className="input-seller"
            onChange={(event) =>
              setForm({ ...form, location: event.target.value })
            }
            value={form.location}
          />
        </Field>

        <Field label="Deskripsi UMKM">
          <textarea
            className="input-seller min-h-28"
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            value={form.description}
          />
        </Field>

        <div className="mt-5 flex justify-end">
          <button
            className="h-11 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white hover:bg-[#004D2E]"
            type="button"
          >
            Simpan Profil
          </button>
        </div>
      </form>
    </>
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