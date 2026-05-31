import { Eye, PackageCheck } from 'lucide-react'

import { formatDateTime, formatPaymentMethod, formatRupiah } from '../components/format'
import { StatusBadge } from '../components/status-badge'
import type { SellerOrder, SellerOrderStatus } from '../types'

type SellerOrderCardProps = {
  order: SellerOrder
  onOpenPaymentProof: (order: SellerOrder) => void
  onUpdateStatus: (orderId: string, status: SellerOrderStatus) => void
}

export function SellerOrderCard({
  onOpenPaymentProof,
  onUpdateStatus,
  order,
}: SellerOrderCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{order.id}</h3>
            <StatusBadge status={order.status} />
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {order.buyerName} • {formatDateTime(order.orderedAt)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm text-slate-500">
            {formatPaymentMethod(order.paymentMethod)}
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatRupiah(order.total)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3">
        {order.items.map((item) => (
          <div className="flex justify-between gap-3 text-sm" key={item.id}>
            <div>
              <p className="font-medium text-slate-800">{item.productName}</p>
              {item.note ? (
                <p className="text-xs text-slate-500">Catatan: {item.note}</p>
              ) : null}
            </div>
            <p className="shrink-0 text-slate-500">x{item.quantity}</p>
          </div>
        ))}
      </div>

      {order.rejectionReason ? (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          Alasan ditolak: {order.rejectionReason}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {order.status === 'pending_payment' ? (
          <button
            className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600"
            type="button"
          >
            Menunggu pembayaran pembeli
          </button>
        ) : null}

        {order.status === 'waiting_verification' ? (
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#006B3F] px-3 text-sm font-medium text-white hover:bg-[#004D2E]"
            onClick={() => onOpenPaymentProof(order)}
            type="button"
          >
            <Eye className="size-4" />
            Lihat Bukti
          </button>
        ) : null}

        {order.status === 'processing' ? (
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#F4B400] px-3 text-sm font-medium text-slate-900 hover:brightness-95"
            onClick={() => onUpdateStatus(order.id, 'ready')}
            type="button"
          >
            <PackageCheck className="size-4" />
            Tandai Siap Diambil
          </button>
        ) : null}

        {order.status === 'ready' ? (
          <button
            className="inline-flex h-10 items-center rounded-xl bg-[#006B3F] px-3 text-sm font-medium text-white hover:bg-[#004D2E]"
            onClick={() => onUpdateStatus(order.id, 'completed')}
            type="button"
          >
            Tandai Selesai
          </button>
        ) : null}
      </div>
    </article>
  )
}