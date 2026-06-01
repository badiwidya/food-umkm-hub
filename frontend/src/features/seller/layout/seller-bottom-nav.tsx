import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Package, Percent, ReceiptText, UserRound } from 'lucide-react'

type ActiveNavItem = {
  disabled?: false
  icon: typeof Home
  label: string
  to: '/seller' | '/seller/products'
}

type DisabledNavItem = {
  disabled: true
  icon: typeof Home
  label: string
}

type NavItem = ActiveNavItem | DisabledNavItem

const NAV_ITEMS = [
  {
    icon: Home,
    label: 'Beranda',
    to: '/seller',
  },
  {
    icon: Package,
    label: 'Produk',
    to: '/seller/products',
  },
  {
    disabled: true,
    icon: ReceiptText,
    label: 'Pesanan',
  },
  {
    disabled: true,
    icon: Percent,
    label: 'Promo',
  },
  {
    disabled: true,
    icon: UserRound,
    label: 'Profil',
  },
] satisfies Array<NavItem>

export function SellerBottomNav() {
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <nav
      aria-label="Navigasi penjual"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-sm border-t border-slate-200 bg-white"
    >
      <ul className="grid h-16 grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon

          if (item.disabled) {
            return (
              <li key={item.label}>
                <button
                  aria-disabled="true"
                  className="flex h-full w-full cursor-not-allowed flex-col items-center justify-center gap-1 text-xs leading-4 text-slate-400"
                  disabled
                  type="button"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-6"
                    strokeWidth={2.2}
                  />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          }

          const isActive =
            currentPath === item.to ||
            (item.to !== '/seller' && currentPath.startsWith(item.to))

          return (
            <li key={item.to}>
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex h-full flex-col items-center justify-center gap-1 text-xs leading-4 transition',
                  isActive
                    ? 'text-[#1e40af]'
                    : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}
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
