import type { LucideIcon } from 'lucide-react'

type SellerMetricCardProps = {
  accentClassName: string
  helperText?: string
  icon: LucideIcon
  label: string
  value: string
}

export function SellerMetricCard({
  accentClassName,
  helperText,
  icon: Icon,
  label,
  value,
}: SellerMetricCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={[
          'flex size-10 items-center justify-center rounded-lg',
          accentClassName,
        ].join(' ')}
      >
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <p className="mt-3 text-xs leading-4 text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xl font-medium leading-7 text-slate-900">
        {value}
      </p>
      {helperText ? (
        <p className="mt-1 truncate text-xs leading-4 text-slate-500">
          {helperText}
        </p>
      ) : null}
    </article>
  )
}
