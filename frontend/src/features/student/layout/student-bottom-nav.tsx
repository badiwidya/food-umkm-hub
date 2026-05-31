import { Activity, Heart, Home, Store } from 'lucide-react'

type NavItem = {
  href: string
  icon: typeof Home
  label: string
}

const NAV_ITEMS = [
  {
    href: '/',
    icon: Home,
    label: 'Beranda',
  },
  {
    href: '/stores',
    icon: Store,
    label: 'UMKM',
  },
  {
    href: '/favorites',
    icon: Heart,
    label: 'Favorit',
  },
  {
    href: '/activity',
    icon: Activity,
    label: 'Aktivitas',
  },
] satisfies Array<NavItem>

export function StudentBottomNav() {
  const currentPath = window.location.pathname

  return (
    <nav
      aria-label="Navigasi mahasiswa"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-sm border-t border-slate-200 bg-white"
    >
      <ul className="grid h-16 grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/'
              ? currentPath === '/'
              : currentPath.startsWith(item.href)

          return (
            <li key={item.href}>
              <a
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex h-full flex-col items-center justify-center gap-1 text-xs leading-4 transition',
                  isActive
                    ? 'text-[#1e40af]'
                    : 'text-slate-500 hover:text-slate-700',
                ]
                  .filter(Boolean)
                  .join(' ')}
                href={item.href}
              >
                <Icon aria-hidden="true" className="size-6" strokeWidth={2.2} />
                <span>{item.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
