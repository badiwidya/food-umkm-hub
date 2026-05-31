import type { ReactNode } from 'react'

type SellerDashboardCardProps = {
  title: string
  value: string
  description?: string
  icon?: ReactNode
}

export function SellerDashboardCard({
  description,
  icon,
  title,
  value,
}: SellerDashboardCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        {icon ? (
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#006B3F]/10 text-[#006B3F]">
            {icon}
          </div>
        ) : null}
      </div>

      {description ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
      ) : null}
    </div>
  )
}