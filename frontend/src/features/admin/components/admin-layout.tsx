import { Link, useRouterState } from '@tanstack/react-router'
import {
  BarChart3,
  ClipboardList,
  Package,
  Settings,
  ShieldCheck,
  Store,
  UserCheck,
} from 'lucide-react'
import type { ReactNode } from 'react'

const navItems = [
  {
    icon: BarChart3,
    label: 'Dashboard',
    to: '/admin',
  },
  {
    icon: ClipboardList,
    label: 'Laporan',
    to: '/admin/reports',
  },
  {
    icon: ShieldCheck,
    label: 'Verifikasi',
    to: '/admin/verification',
  },
  {
    icon: Store,
    label: 'Data UMKM',
    to: '/admin/stores',
  },
  {
    icon: UserCheck,
    label: 'Data Penjual',
    to: '/admin/sellers',
  },
  {
    icon: Package,
    label: 'Produk UMKM',
    to: '/admin/products',
  },
  {
    icon: Settings,
    label: 'Pengaturan',
    to: '/admin',
  },
] as const

type AdminLayoutProps = {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <main className="min-h-screen bg-[#F8FAF7] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#006B3F] text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Admin Center</p>
            <p className="text-xs text-slate-500">Food UMKM Hub</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const active =
              item.to === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.to)

            return (
              <Link
                className={[
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                  active
                    ? 'bg-[#006B3F] text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
                key={`${item.label}-${item.to}`}
                to={item.to}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <section className="min-h-screen pb-24 lg:pl-72 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
          {navItems.slice(0, 6).map((item) => {
            const active =
              item.to === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.to)

            return (
              <Link
                className={[
                  'flex flex-col items-center justify-center rounded-xl px-2 py-2 text-[10px] font-medium transition',
                  active
                    ? 'bg-[#006B3F]/10 text-[#006B3F]'
                    : 'text-slate-500 hover:bg-slate-50',
                ].join(' ')}
                key={`${item.label}-mobile`}
                to={item.to}
              >
                <item.icon className="mb-1 size-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </main>
  )
}
