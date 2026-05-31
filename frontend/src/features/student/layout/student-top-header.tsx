import { UserRound } from 'lucide-react'
import type { ReactNode } from 'react'

type StudentTopHeaderProps = {
  children?: ReactNode
  subtitle: string
  title: string
}

export function StudentTopHeader({
  children,
  subtitle,
  title,
}: StudentTopHeaderProps) {
  return (
    <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-medium leading-7">{title}</h1>
          <p className="mt-1 truncate text-sm leading-5 text-white/80">
            {subtitle}
          </p>
        </div>
        <button
          aria-label="Profil"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          type="button"
        >
          <UserRound aria-hidden="true" className="size-6" />
        </button>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  )
}
