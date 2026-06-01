import { Link, useRouterState } from '@tanstack/react-router'
import { Activity, Heart, Home, Store } from 'lucide-react'

type NavItem = {
  icon: typeof Home
  label: string
  to: '/' | '/stores' | '/favorites' | '/activity'
}

const NAV_ITEMS = [
  {
    icon: Home,
    label: 'Beranda',
    to: '/',
  },
  {
    icon: Store,
    label: 'UMKM',
    to: '/stores',
  },
  {
    icon: Heart,
    label: 'Favorit',
    to: '/favorites',
  },
  {
    icon: Activity,
    label: 'Aktivitas',
    to: '/activity',
  },
] satisfies Array<NavItem>

export function StudentBottomNav() {
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <nav
      aria-label="Navigasi mahasiswa"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-sm border-t border-slate-200 bg-white"
    >
      <ul className="grid h-16 grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.to === '/'
              ? currentPath === '/'
              : currentPath.startsWith(item.to)

          return (
            <li key={item.to}>
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex h-full flex-col items-center justify-center gap-1 text-xs leading-4 transition',
                  isActive
                    ? 'text-[#1e40af]'
                    : 'text-slate-500 hover:text-slate-700',
                ]
                  .filter(Boolean)
                  .join(' ')}
                to={item.to}
              >
                <Icon aria-hidden="true" className="size-6" strokeWidth={2.2} />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
