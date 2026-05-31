type AdminStatusBadgeProps = {
  status: string
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Aktif',
  high: 'Tinggi',
  inactive: 'Nonaktif',
  low: 'Rendah',
  medium: 'Sedang',
  new: 'Baru',
  pending: 'Pending',
  processing: 'Diproses',
  rejected: 'Ditolak',
  resolved: 'Selesai',
  verified: 'Verified',
  waiting_response: 'Menunggu Respon',
}

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  high: 'bg-red-100 text-red-700',
  inactive: 'bg-slate-100 text-slate-600',
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  new: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-[#006B3F]/10 text-[#006B3F]',
  rejected: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
  verified: 'bg-green-100 text-green-700',
  waiting_response: 'bg-purple-100 text-purple-700',
}

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
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
