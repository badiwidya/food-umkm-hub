import { useState } from 'react'

import { formatDateTime, formatPaymentMethod, formatRupiah } from '../components/format'
import type { SellerOrder } from '../types'

type PaymentProofModalProps = {
  order: SellerOrder | null
  onClose: () => void
  onConfirm: (orderId: string) => void
  onReject: (orderId: string, reason: string) => void
}

export function PaymentProofModal({
  onClose,
  onConfirm,
  onReject,
  order,
}: PaymentProofModalProps) {
  const [reason, setReason] = useState('')

  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 pb-4 sm:items-center sm:pb-0">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Verifikasi Pembayaran
            </h2>
            <p className="mt-1 text-sm text-slate-500">{order.id}</p>
          </div>

          <button
            className="rounded-full px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            Tutup
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {order.paymentProofUrl ? (
            <img
              alt={`Bukti pembayaran ${order.id}`}
              className="max-h-72 w-full rounded-xl object-cover"
              src={order.paymentProofUrl}
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl bg-white text-sm text-slate-400">
              Preview bukti pembayaran belum tersedia
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Nama pembeli" value={order.buyerName} />
          <Info label="Nama pengirim" value={order.senderName ?? '-'} />
          <Info label="Metode" value={formatPaymentMethod(order.paymentMethod)} />
          <Info label="Total pesanan" value={formatRupiah(order.total)} />
          <Info
            label="Waktu upload"
            value={order.uploadedAt ? formatDateTime(order.uploadedAt) : '-'}
          />
          <Info label="Status" value="Menunggu Verifikasi" />
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-slate-700">
            Alasan penolakan
          </span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Isi jika pembayaran ditolak"
            value={reason}
          />
        </label>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            className="h-11 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 hover:bg-red-100"
            onClick={() => onReject(order.id, reason || 'Bukti pembayaran tidak valid.')}
            type="button"
          >
            Tolak Pembayaran
          </button>

          <button
            className="h-11 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white hover:bg-[#004D2E]"
            onClick={() => onConfirm(order.id)}
            type="button"
          >
            Konfirmasi Pembayaran
          </button>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  )
}