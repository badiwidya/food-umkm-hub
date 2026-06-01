import type { ReactNode } from 'react'

import { SellerBottomNav } from './seller-bottom-nav'

type SellerAppShellProps = {
  children: ReactNode
}

export function SellerAppShell({ children }: SellerAppShellProps) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col bg-white shadow-sm">
        <div className="flex-1 pb-20">{children}</div>
        <SellerBottomNav />
      </div>
    </main>
  )
}
