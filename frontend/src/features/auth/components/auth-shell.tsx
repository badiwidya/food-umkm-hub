import { Utensils } from 'lucide-react'
import type { ReactNode } from 'react'

type AuthShellProps = {
  children: ReactNode
  subtitle?: string
  title?: string
  variant?: 'brand' | 'status'
}

export function AuthShell({
  children,
  subtitle,
  title,
  variant = 'brand',
}: AuthShellProps) {
  const isStatus = variant === 'status'

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1e40af] to-[#3154bd] px-4 py-8 text-slate-900">
      <div
        className={
          isStatus
            ? 'mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[366px] items-center'
            : 'mx-auto flex w-full max-w-[366px] flex-col gap-6'
        }
      >
        {isStatus ? null : (
          <header className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-lg">
              <Utensils aria-hidden="true" className="size-8" />
            </div>
            {title ? (
              <h1 className="text-2xl font-medium leading-8 text-white">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="text-sm leading-5 text-white/80">{subtitle}</p>
            ) : null}
          </header>
        )}

        <section
          className={
            isStatus
              ? 'flex min-h-[687px] w-full flex-col items-center justify-center rounded-[10px] bg-white px-6 text-center'
              : 'w-full rounded-2xl bg-white p-6 shadow-2xl'
          }
        >
          {children}
        </section>
      </div>
    </main>
  )
}
