import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

type SellerProfilePageHeaderProps = {
  actions?: ReactNode
  title: string
}

export function SellerProfilePageHeader({
  actions,
  title,
}: SellerProfilePageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 bg-[#1e40af] px-3 py-2 text-white">
      <div className="flex h-10 items-center gap-3">
        <button
          aria-label="Kembali"
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10"
          onClick={() => navigate({ to: '/seller/profile' })}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="size-6" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-lg font-medium leading-7">
          {title}
        </h1>
        {actions}
      </div>
    </header>
  )
}
