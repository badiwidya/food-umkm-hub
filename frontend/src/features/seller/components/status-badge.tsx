import type { SellerOrderStatus, SellerStoreProfile } from '../types'

type StatusBadgeProps = {
  status: SellerOrderStatus | SellerStoreProfile['verificationStatus'] | string
}

const STATUS_STYLE: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  not_verified: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
  pending_payment: 'bg-slate-100 text-slate-700',
  processing: 'bg-blue-100 text-blue-700',
  ready: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  verified: 'bg-green-100 text-green-700',
  waiting_verification: 'bg-yellow-100 text-yellow-700',
}

const STATUS_LABEL: Record<string, string> = {
  completed: 'Selesai',
  not_verified: 'Belum Verified',
  pending: 'Pending',
  pending_payment: 'Pending Pembayaran',
  processing: 'Diproses',
  ready: 'Siap Diambil',
  rejected: 'Ditolak',
  verified: 'Verified',
  waiting_verification: 'Menunggu Verifikasi',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-700',
      ].join(' ')}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}