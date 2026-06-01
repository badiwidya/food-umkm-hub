import type { ReactNode } from 'react'

type ProfileInfoRowProps = {
  icon: ReactNode
  label: string
  value: string
}

export function ProfileInfoRow({ icon, label, value }: ProfileInfoRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e40af]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs leading-4 text-slate-500">{label}</p>
        <p className="mt-1 truncate text-sm leading-5 text-slate-800">
          {value || '-'}
        </p>
      </div>
    </div>
  )
}
