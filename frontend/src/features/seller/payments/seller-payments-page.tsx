import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import { getSellerProfile } from '../services/seller-service'
import type { SellerStoreProfile } from '../types'

export function SellerPaymentsPage() {
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
          description="Atur rekening, QRIS, dan instruksi pembayaran."
          title="Pembayaran"
        />
        <LoadingState />
      </>
    )
  }

  return (
    <>
      <PageHeader
        description="Atur rekening bank dan QRIS untuk menerima pembayaran pembeli."
        title="Pembayaran dan Rekening"
      />

      <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama bank">
            <input
              className="input-seller"
              onChange={(event) =>
                setForm({ ...form, bankName: event.target.value })
              }
              value={form.bankName}
            />
          </Field>

          <Field label="Nomor rekening">
            <input
              className="input-seller"
              onChange={(event) =>
                setForm({ ...form, bankAccountNumber: event.target.value })
              }
              value={form.bankAccountNumber}
            />
          </Field>

          <Field label="Nama pemilik rekening">
            <input
              className="input-seller"
              onChange={(event) =>
                setForm({ ...form, bankAccountOwner: event.target.value })
              }
              value={form.bankAccountOwner}
            />
          </Field>

          <Field label="URL QRIS / path gambar">
            <input
              className="input-seller"
              onChange={(event) =>
                setForm({ ...form, qrisUrl: event.target.value })
              }
              placeholder="Nanti disambungkan ke upload file"
              value={form.qrisUrl ?? ''}
            />
          </Field>
        </div>

        <Field label="Instruksi pembayaran">
          <textarea
            className="input-seller min-h-28"
            onChange={(event) =>
              setForm({ ...form, paymentInstruction: event.target.value })
            }
            value={form.paymentInstruction}
          />
        </Field>

        <div className="mt-5 flex justify-end">
          <button
            className="h-11 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white hover:bg-[#004D2E]"
            type="button"
          >
            Simpan Pengaturan
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
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}