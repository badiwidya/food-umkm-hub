import type { ReactNode } from 'react'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'

import { useClickOutside } from '../../../lib/use-click-outside'
import { useAuthStore } from '../../../stores/auth-store'

type AdminAppShellProps = {
  children: ReactNode
}

export function AdminAppShell({ children }: AdminAppShellProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(
    () => setIsMenuOpen(false),
    isMenuOpen,
  )

  function handleLogout() {
    clearAuth()
    setIsMenuOpen(false)
    void navigate({ to: '/login' })
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-sm font-medium leading-5 text-[#1e40af]">
              Food & UMKM Hub
            </p>
            <h1 className="truncate text-xl font-semibold leading-7 text-slate-900">
              Admin
            </h1>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50"
              onClick={() => setIsMenuOpen((value) => !value)}
              type="button"
            >
              <AdminAvatar
                avatarUrl={user?.avatarUrl ?? null}
                name={user?.fullName ?? 'Admin'}
              />
              <span className="hidden min-w-0 text-right sm:block">
                <span className="block truncate text-sm font-medium leading-5 text-slate-800">
                  {user?.fullName ?? 'Admin'}
                </span>
                <span className="block truncate text-sm leading-5 text-slate-500">
                  {user?.email ?? 'Kurasi UMKM'}
                </span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className={[
                  'size-4 shrink-0 text-slate-400 transition',
                  isMenuOpen ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            {isMenuOpen ? (
              <div
                className="absolute right-0 top-14 z-30 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                role="menu"
              >
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium leading-5 text-red-600 transition hover:bg-red-50"
                  onClick={handleLogout}
                  role="menuitem"
                  type="button"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  Keluar
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  )
}

function AdminAvatar({
  avatarUrl,
  name,
}: {
  avatarUrl: string | null
  name: string
}) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-[#1e40af]">
      {avatarUrl ? (
        <img alt={name} className="size-full object-cover" src={avatarUrl} />
      ) : (
        <UserRound aria-hidden="true" className="size-5" />
      )}
    </span>
  )
}
