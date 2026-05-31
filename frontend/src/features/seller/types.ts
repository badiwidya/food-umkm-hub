mkdir -p frontend/src/features/seller/components
mkdir -p frontend/src/features/seller/pages
mkdir -p frontend/src/features/seller/services
mkdir -p frontend/src/features/seller/utils

cat > frontend/src/features/seller/types.ts <<'EOF'
export type SellerVerificationStatus = 'verified' | 'pending' | 'not_verified'
export type SellerStoreStatus = 'open' | 'closed'

export type SellerOrderStatus =
  | 'pending_payment'
  | 'waiting_verification'
  | 'processing'
  | 'ready'
  | 'completed'
  | 'rejected'

export type SellerPaymentMethod = 'transfer' | 'qris' | 'cod'

export type SellerOrderItem = {
  id: string
  name: string
  quantity: number
  price: number
  note?: string
}

export type SellerOrder = {
  id: string
  buyerName: string
  createdAt: string
  items: SellerOrderItem[]
  total: number
  paymentMethod: SellerPaymentMethod
  status: SellerOrderStatus
  paymentProofUrl?: string | null
  senderName?: string | null
  paymentUploadedAt?: string | null
  rejectReason?: string | null
}

export type SellerProduct = {
  id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
  photoUrl?: string | null
  estimatedMinutes: number
}

export type SellerProductFormValues = {
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
  photoUrl?: string
  estimatedMinutes: number
}

export type SellerDashboardSummary = {
  todayOrders: number
  processingOrders: number
  waitingVerificationOrders: number
  completedOrders: number
  todayRevenue: number
  bestSellingProduct: string | null
  storeStatus: SellerStoreStatus
  verificationStatus: SellerVerificationStatus
  revenueSeries: Array<{
    label: string
    revenue: number
    orders: number
  }>
}

export type SellerStoreProfile = {
  storeName: string
  ownerName: string
  description: string
  location: string
  openTime: string
  closeTime: string
  storeStatus: SellerStoreStatus
  verificationStatus: SellerVerificationStatus
  logoUrl?: string
  bannerUrl?: string
  bankName: string
  bankAccountNumber: string
  bankAccountHolder: string
  qrisUrl?: string
  paymentInstruction: string
}
EOF

cat > frontend/src/features/seller/utils/format.ts <<'EOF'
import type {
  SellerOrderStatus,
  SellerPaymentMethod,
  SellerVerificationStatus,
} from '../types'

export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  })
    .format(value)
    .replace(/\s/g, ' ')
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function getPaymentMethodLabel(method: SellerPaymentMethod) {
  const labels: Record<SellerPaymentMethod, string> = {
    cod: 'Bayar di Tempat',
    qris: 'QRIS',
    transfer: 'Transfer',
  }

  return labels[method]
}

export function getOrderStatusLabel(status: SellerOrderStatus) {
  const labels: Record<SellerOrderStatus, string> = {
    completed: 'Selesai',
    pending_payment: 'Pending Pembayaran',
    processing: 'Diproses',
    ready: 'Siap Diambil',
    rejected: 'Ditolak',
    waiting_verification: 'Menunggu Verifikasi',
  }

  return labels[status]
}

export function getVerificationStatusLabel(status: SellerVerificationStatus) {
  const labels: Record<SellerVerificationStatus, string> = {
    not_verified: 'Not Verified',
    pending: 'Pending',
    verified: 'Verified',
  }

  return labels[status]
}
EOF

cat > frontend/src/features/seller/services/seller-service.ts <<'EOF'
import type {
  SellerDashboardSummary,
  SellerOrder,
  SellerProduct,
  SellerProductFormValues,
  SellerStoreProfile,
} from '../types'

const emptyProfile: SellerStoreProfile = {
  bankAccountHolder: '',
  bankAccountNumber: '',
  bankName: '',
  bannerUrl: '',
  closeTime: '17:00',
  description: '',
  location: '',
  logoUrl: '',
  openTime: '08:00',
  ownerName: '',
  paymentInstruction: '',
  qrisUrl: '',
  storeName: '',
  storeStatus: 'closed',
  verificationStatus: 'pending',
}

export async function getSellerDashboard(): Promise<SellerDashboardSummary> {
  return {
    bestSellingProduct: null,
    completedOrders: 0,
    processingOrders: 0,
    revenueSeries: [],
    storeStatus: 'closed',
    todayOrders: 0,
    todayRevenue: 0,
    verificationStatus: 'pending',
    waitingVerificationOrders: 0,
  }
}

export async function getSellerOrders(): Promise<SellerOrder[]> {
  return []
}

export async function confirmSellerPayment(_orderId: string): Promise<void> {
  return Promise.resolve()
}

export async function rejectSellerPayment(
  _orderId: string,
  _reason: string,
): Promise<void> {
  return Promise.resolve()
}

export async function updateSellerOrderStatus(
  _orderId: string,
  _status: string,
): Promise<void> {
  return Promise.resolve()
}

export async function getSellerProducts(): Promise<SellerProduct[]> {
  return []
}

export async function createSellerProduct(
  _payload: SellerProductFormValues,
): Promise<void> {
  return Promise.resolve()
}

export async function updateSellerProduct(
  _productId: string,
  _payload: SellerProductFormValues,
): Promise<void> {
  return Promise.resolve()
}

export async function toggleSellerProductAvailability(
  _productId: string,
): Promise<void> {
  return Promise.resolve()
}

export async function getSellerStoreProfile(): Promise<SellerStoreProfile> {
  return emptyProfile
}

export async function updateSellerStoreProfile(
  _payload: SellerStoreProfile,
): Promise<void> {
  return Promise.resolve()
}

export async function updateSellerPaymentSettings(
  _payload: Pick<
    SellerStoreProfile,
    | 'bankAccountHolder'
    | 'bankAccountNumber'
    | 'bankName'
    | 'paymentInstruction'
    | 'qrisUrl'
  >,
): Promise<void> {
  return Promise.resolve()
}
EOF

cat > frontend/src/features/seller/components/status-badge.tsx <<'EOF'
import type {
  SellerOrderStatus,
  SellerStoreStatus,
  SellerVerificationStatus,
} from '../types'
import {
  getOrderStatusLabel,
  getVerificationStatusLabel,
} from '../utils/format'

type StatusBadgeProps = {
  status: SellerOrderStatus | SellerVerificationStatus | SellerStoreStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status)

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        config.className,
      ].join(' ')}
    >
      {config.label}
    </span>
  )
}

function getStatusConfig(status: StatusBadgeProps['status']) {
  if (status === 'open') {
    return {
      className: 'bg-green-100 text-green-700',
      label: 'Buka',
    }
  }

  if (status === 'closed') {
    return {
      className: 'bg-red-100 text-red-700',
      label: 'Tutup',
    }
  }

  if (status === 'verified') {
    return {
      className: 'bg-green-100 text-green-700',
      label: getVerificationStatusLabel(status),
    }
  }

  if (status === 'pending') {
    return {
      className: 'bg-amber-100 text-amber-700',
      label: getVerificationStatusLabel(status),
    }
  }

  if (status === 'not_verified') {
    return {
      className: 'bg-red-100 text-red-700',
      label: getVerificationStatusLabel(status),
    }
  }

  const orderConfig: Record<
    SellerOrderStatus,
    {
      className: string
      label: string
    }
  > = {
    completed: {
      className: 'bg-green-100 text-green-700',
      label: getOrderStatusLabel('completed'),
    },
    pending_payment: {
      className: 'bg-slate-100 text-slate-700',
      label: getOrderStatusLabel('pending_payment'),
    },
    processing: {
      className: 'bg-blue-100 text-blue-700',
      label: getOrderStatusLabel('processing'),
    },
    ready: {
      className: 'bg-emerald-100 text-emerald-700',
      label: getOrderStatusLabel('ready'),
    },
    rejected: {
      className: 'bg-red-100 text-red-700',
      label: getOrderStatusLabel('rejected'),
    },
    waiting_verification: {
      className: 'bg-amber-100 text-amber-700',
      label: getOrderStatusLabel('waiting_verification'),
    },
  }

  return orderConfig[status]
}
EOF

cat > frontend/src/features/seller/components/empty-state.tsx <<'EOF'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description: string
  icon?: LucideIcon
}

export function EmptyState({
  description,
  icon: Icon = Inbox,
  title,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#006B3F]/10 text-[#006B3F]">
        <Icon aria-hidden="true" className="size-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  )
}
EOF

cat > frontend/src/features/seller/components/loading-state.tsx <<'EOF'
type LoadingStateProps = {
  rows?: number
}

export function LoadingState({ rows = 4 }: LoadingStateProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
          key={index}
        >
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="mt-3 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}
EOF

cat > frontend/src/features/seller/components/confirm-modal.tsx <<'EOF'
type ConfirmModalProps = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmModal({
  cancelLabel = 'Batal',
  confirmLabel = 'Ya, lanjutkan',
  description,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmModalProps) {
  if (!open) {
    return null
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 pb-4 sm:items-center sm:pb-0"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>

          <button
            className="h-11 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white transition hover:bg-[#004D2E]"
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
EOF

cat > frontend/src/features/seller/components/seller-dashboard-card.tsx <<'EOF'
import type { LucideIcon } from 'lucide-react'

type SellerDashboardCardProps = {
  title: string
  value: string
  description?: string
  icon: LucideIcon
}

export function SellerDashboardCard({
  description,
  icon: Icon,
  title,
  value,
}: SellerDashboardCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
        </div>

        <div className="flex size-10 items-center justify-center rounded-xl bg-[#006B3F]/10 text-[#006B3F]">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </div>

      {description ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
      ) : null}
    </article>
  )
}
EOF

cat > frontend/src/features/seller/components/seller-sidebar.tsx <<'EOF'
import { Link } from '@tanstack/react-router'
import {
  CreditCard,
  LayoutDashboard,
  Package,
  ReceiptText,
  Store,
} from 'lucide-react'

const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    to: '/seller',
  },
  {
    icon: ReceiptText,
    label: 'Pesanan',
    to: '/seller/orders',
  },
  {
    icon: Package,
    label: 'Produk',
    to: '/seller/products',
  },
  {
    icon: CreditCard,
    label: 'Pembayaran',
    to: '/seller/payments',
  },
  {
    icon: Store,
    label: 'Profil UMKM',
    to: '/seller/profile',
  },
] as const

export function SellerSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-6 md:block">
      <div className="rounded-2xl bg-[#006B3F] p-4 text-white">
        <p className="text-xs font-medium uppercase tracking-wide text-white/70">
          Seller Panel
        </p>
        <h1 className="mt-1 text-lg font-bold">Food UMKM Hub</h1>
        <p className="mt-1 text-xs leading-5 text-white/75">
          Kelola pesanan, produk, dan profil UMKM.
        </p>
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <Link
              activeProps={{
                className: 'bg-[#006B3F] text-white',
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              key={item.to}
              to={item.to}
            >
              <Icon aria-hidden="true" className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
EOF

cat > frontend/src/features/seller/components/seller-bottom-nav.tsx <<'EOF'
import { Link } from '@tanstack/react-router'
import {
  CreditCard,
  LayoutDashboard,
  Package,
  ReceiptText,
  Store,
} from 'lucide-react'

const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Home',
    to: '/seller',
  },
  {
    icon: ReceiptText,
    label: 'Pesanan',
    to: '/seller/orders',
  },
  {
    icon: Package,
    label: 'Produk',
    to: '/seller/products',
  },
  {
    icon: CreditCard,
    label: 'Bayar',
    to: '/seller/payments',
  },
  {
    icon: Store,
    label: 'Profil',
    to: '/seller/profile',
  },
] as const

export function SellerBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <Link
              activeProps={{
                className: 'text-[#006B3F]',
              }}
              className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium text-slate-500 transition hover:bg-slate-50"
              key={item.to}
              to={item.to}
            >
              <Icon aria-hidden="true" className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
EOF

cat > frontend/src/features/seller/components/seller-layout.tsx <<'EOF'
import type { ReactNode } from 'react'

import { SellerBottomNav } from './seller-bottom-nav'
import { SellerSidebar } from './seller-sidebar'

type SellerLayoutProps = {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
}

export function SellerLayout({
  action,
  children,
  description,
  title,
}: SellerLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F8FAF7] text-slate-900">
      <div className="flex min-h-screen">
        <SellerSidebar />

        <section className="min-w-0 flex-1 pb-24 md:pb-0">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#006B3F]">
                  Panel Penjual
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  {title}
                </h1>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>

              {action ? <div className="shrink-0">{action}</div> : null}
            </div>
          </header>

          <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </section>
      </div>

      <SellerBottomNav />
    </main>
  )
}
EOF

cat > frontend/src/features/seller/components/seller-order-tabs.tsx <<'EOF'
import type { SellerOrderStatus } from '../types'

export type SellerOrderTab = 'all' | SellerOrderStatus

const tabs: Array<{
  label: string
  value: SellerOrderTab
}> = [
  {
    label: 'Semua',
    value: 'all',
  },
  {
    label: 'Pending Pembayaran',
    value: 'pending_payment',
  },
  {
    label: 'Menunggu Verifikasi',
    value: 'waiting_verification',
  },
  {
    label: 'Diproses',
    value: 'processing',
  },
  {
    label: 'Selesai',
    value: 'completed',
  },
  {
    label: 'Ditolak',
    value: 'rejected',
  },
]

type SellerOrderTabsProps = {
  value: SellerOrderTab
  onChange: (value: SellerOrderTab) => void
}

export function SellerOrderTabs({ onChange, value }: SellerOrderTabsProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const isActive = tab.value === value

          return (
            <button
              className={[
                'h-10 rounded-full border px-4 text-sm font-medium transition',
                isActive
                  ? 'border-[#006B3F] bg-[#006B3F] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[#006B3F]/40 hover:text-[#006B3F]',
              ].join(' ')}
              key={tab.value}
              onClick={() => onChange(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
EOF

cat > frontend/src/features/seller/components/seller-order-card.tsx <<'EOF'
import { Eye, Timer, Utensils } from 'lucide-react'

import type { SellerOrder } from '../types'
import {
  formatDateTime,
  formatRupiah,
  getPaymentMethodLabel,
} from '../utils/format'
import { StatusBadge } from './status-badge'

type SellerOrderCardProps = {
  order: SellerOrder
  onOpenPaymentProof: (order: SellerOrder) => void
  onMarkReady: (order: SellerOrder) => void
  onMarkCompleted: (order: SellerOrder) => void
}

export function SellerOrderCard({
  onMarkCompleted,
  onMarkReady,
  onOpenPaymentProof,
  order,
}: SellerOrderCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              {order.buyerName}
            </h3>
            <StatusBadge status={order.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Timer aria-hidden="true" className="size-3.5" />
              {formatDateTime(order.createdAt)}
            </span>
            <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-slate-900">
            {formatRupiah(order.total)}
          </p>
          <p className="text-xs text-slate-500">Total pembayaran</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Utensils aria-hidden="true" className="size-3.5" />
          Item Pesanan
        </p>

        <div className="space-y-2">
          {order.items.map((item) => (
            <div className="flex justify-between gap-3 text-sm" key={item.id}>
              <div>
                <p className="font-medium text-slate-800">
                  {item.quantity}x {item.name}
                </p>
                {item.note ? (
                  <p className="text-xs text-slate-500">Catatan: {item.note}</p>
                ) : null}
              </div>
              <p className="shrink-0 text-slate-700">
                {formatRupiah(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {order.status === 'waiting_verification' ? (
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white transition hover:bg-[#004D2E]"
            onClick={() => onOpenPaymentProof(order)}
            type="button"
          >
            <Eye aria-hidden="true" className="size-4" />
            Cek Bukti
          </button>
        ) : null}

        {order.status === 'processing' ? (
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#F4B400] px-4 text-sm font-medium text-slate-900 transition hover:bg-[#d99f00]"
            onClick={() => onMarkReady(order)}
            type="button"
          >
            Tandai Siap Diambil
          </button>
        ) : null}

        {order.status === 'processing' || order.status === 'ready' ? (
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#006B3F] bg-white px-4 text-sm font-medium text-[#006B3F] transition hover:bg-green-50"
            onClick={() => onMarkCompleted(order)}
            type="button"
          >
            Tandai Selesai
          </button>
        ) : null}

        {order.status === 'pending_payment' ? (
          <p className="text-sm leading-6 text-slate-500">
            Menunggu pembeli melakukan pembayaran. Pesanan belum masuk proses
            masak.
          </p>
        ) : null}

        {order.status === 'rejected' && order.rejectReason ? (
          <p className="text-sm leading-6 text-red-600">
            Alasan ditolak: {order.rejectReason}
          </p>
        ) : null}
      </div>
    </article>
  )
}
EOF

cat > frontend/src/features/seller/components/payment-proof-modal.tsx <<'EOF'
import { useState } from 'react'

import type { SellerOrder } from '../types'
import {
  formatDateTime,
  formatRupiah,
  getPaymentMethodLabel,
} from '../utils/format'

type PaymentProofModalProps = {
  order: SellerOrder | null
  open: boolean
  onClose: () => void
  onConfirm: (order: SellerOrder) => void
  onReject: (order: SellerOrder, reason: string) => void
}

export function PaymentProofModal({
  onClose,
  onConfirm,
  onReject,
  open,
  order,
}: PaymentProofModalProps) {
  const [reason, setReason] = useState('')

  if (!open || !order) {
    return null
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 pb-4 sm:items-center sm:pb-0"
      role="dialog"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Verifikasi Pembayaran
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Periksa bukti pembayaran sebelum pesanan diproses.
            </p>
          </div>

          <button
            className="rounded-full px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            Tutup
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {order.paymentProofUrl ? (
            <img
              alt="Bukti pembayaran"
              className="max-h-72 w-full object-contain"
              src={order.paymentProofUrl}
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">
              Bukti pembayaran belum tersedia
            </div>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Pembeli</dt>
            <dd className="mt-1 font-medium text-slate-900">{order.buyerName}</dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Metode</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {getPaymentMethodLabel(order.paymentMethod)}
            </dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Nama Pengirim</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {order.senderName ?? '-'}
            </dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Nominal</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {formatRupiah(order.total)}
            </dd>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
            <dt className="text-xs text-slate-500">Waktu Upload</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {order.paymentUploadedAt
                ? formatDateTime(order.paymentUploadedAt)
                : '-'}
            </dd>
          </div>
        </dl>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-slate-700">
            Alasan penolakan
          </span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Isi jika pembayaran ingin ditolak"
            value={reason}
          />
        </label>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            className="h-11 rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={reason.trim().length === 0}
            onClick={() => {
              onReject(order, reason.trim())
              setReason('')
            }}
            type="button"
          >
            Tolak Pembayaran
          </button>

          <button
            className="h-11 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white transition hover:bg-[#004D2E]"
            onClick={() => {
              onConfirm(order)
              setReason('')
            }}
            type="button"
          >
            Konfirmasi Pembayaran
          </button>
        </div>
      </div>
    </div>
  )
}
EOF

cat > frontend/src/features/seller/components/product-card.tsx <<'EOF'
import { Pencil, Power } from 'lucide-react'

import type { SellerProduct } from '../types'
import { formatRupiah } from '../utils/format'

type ProductCardProps = {
  product: SellerProduct
  onEdit: (product: SellerProduct) => void
  onToggleAvailability: (product: SellerProduct) => void
}

export function ProductCard({
  onEdit,
  onToggleAvailability,
  product,
}: ProductCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {product.photoUrl ? (
            <img
              alt={product.name}
              className="size-full object-cover"
              src={product.photoUrl}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-slate-400">
              Foto
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-900">
                {product.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {product.description || 'Belum ada deskripsi'}
              </p>
            </div>

            <span
              className={[
                'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                product.isAvailable
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700',
              ].join(' ')}
            >
              {product.isAvailable ? 'Tersedia' : 'Habis'}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">
              {formatRupiah(product.price)}
            </span>
            <span>•</span>
            <span>{product.category || 'Tanpa kategori'}</span>
            <span>•</span>
            <span>{product.estimatedMinutes} menit</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => onEdit(product)}
              type="button"
            >
              <Pencil aria-hidden="true" className="size-3.5" />
              Edit
            </button>

            <button
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#006B3F]/30 bg-white px-3 text-xs font-medium text-[#006B3F] transition hover:bg-green-50"
              onClick={() => onToggleAvailability(product)}
              type="button"
            >
              <Power aria-hidden="true" className="size-3.5" />
              {product.isAvailable ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
EOF

cat > frontend/src/features/seller/components/product-form.tsx <<'EOF'
import type { FormEvent } from 'react'
import { useState } from 'react'

import type { SellerProduct, SellerProductFormValues } from '../types'

type ProductFormProps = {
  initialProduct?: SellerProduct | null
  onCancel: () => void
  onSubmit: (values: SellerProductFormValues) => void
}

const initialValues: SellerProductFormValues = {
  category: '',
  description: '',
  estimatedMinutes: 10,
  isAvailable: true,
  name: '',
  photoUrl: '',
  price: 0,
}

export function ProductForm({
  initialProduct,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<SellerProductFormValues>(
    initialProduct
      ? {
          category: initialProduct.category,
          description: initialProduct.description,
          estimatedMinutes: initialProduct.estimatedMinutes,
          isAvailable: initialProduct.isAvailable,
          name: initialProduct.name,
          photoUrl: initialProduct.photoUrl ?? '',
          price: initialProduct.price,
        }
      : initialValues,
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(values)
  }

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {initialProduct ? 'Edit Produk' : 'Tambah Produk'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Isi informasi produk agar mudah dipahami pembeli.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Nama produk</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
            value={values.name}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Deskripsi</span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            value={values.description}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Harga</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
            min={0}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                price: Number(event.target.value),
              }))
            }
            required
            type="number"
            value={values.price}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Kategori</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            value={values.category}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Estimasi pembuatan
          </span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
            min={1}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                estimatedMinutes: Number(event.target.value),
              }))
            }
            type="number"
            value={values.estimatedMinutes}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">URL foto</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                photoUrl: event.target.value,
              }))
            }
            value={values.photoUrl}
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 sm:col-span-2">
          <input
            checked={values.isAvailable}
            className="size-4 accent-[#006B3F]"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                isAvailable: event.target.checked,
              }))
            }
            type="checkbox"
          />
          <span className="text-sm font-medium text-slate-700">
            Produk tersedia
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          onClick={onCancel}
          type="button"
        >
          Batal
        </button>

        <button
          className="h-11 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white transition hover:bg-[#004D2E]"
          type="submit"
        >
          Simpan Produk
        </button>
      </div>
    </form>
  )
}
EOF

cat > frontend/src/features/seller/components/store-profile-form.tsx <<'EOF'
import type { FormEvent } from 'react'
import { useState } from 'react'

import type { SellerStoreProfile } from '../types'
import { StatusBadge } from './status-badge'

type StoreProfileFormProps = {
  profile: SellerStoreProfile
  onSubmit: (profile: SellerStoreProfile) => void
}

export function StoreProfileForm({ onSubmit, profile }: StoreProfileFormProps) {
  const [values, setValues] = useState(profile)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(values)
  }

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Profil UMKM
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Lengkapi informasi toko agar pembeli mudah mengenali UMKM.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={values.storeStatus} />
          <StatusBadge status={values.verificationStatus} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput
          label="Nama UMKM"
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              storeName: value,
            }))
          }
          value={values.storeName}
        />

        <TextInput
          label="Nama pemilik"
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              ownerName: value,
            }))
          }
          value={values.ownerName}
        />

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Deskripsi</span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            value={values.description}
          />
        </label>

        <TextInput
          label="Lokasi"
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              location: value,
            }))
          }
          value={values.location}
        />

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Status toko
          </span>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                storeStatus: event.target.value === 'open' ? 'open' : 'closed',
              }))
            }
            value={values.storeStatus}
          >
            <option value="open">Buka</option>
            <option value="closed">Tutup</option>
          </select>
        </label>

        <TextInput
          label="Jam buka"
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              openTime: value,
            }))
          }
          type="time"
          value={values.openTime}
        />

        <TextInput
          label="Jam tutup"
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              closeTime: value,
            }))
          }
          type="time"
          value={values.closeTime}
        />

        <TextInput
          label="Logo URL"
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              logoUrl: value,
            }))
          }
          value={values.logoUrl ?? ''}
        />

        <TextInput
          label="Banner URL"
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              bannerUrl: value,
            }))
          }
          value={values.bannerUrl ?? ''}
        />
      </div>

      <div className="mt-5 flex justify-end">
        <button
          className="h-11 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white transition hover:bg-[#004D2E]"
          type="submit"
        >
          Simpan Profil
        </button>
      </div>
    </form>
  )
}

type TextInputProps = {
  label: string
  value: string
  type?: string
  onChange: (value: string) => void
}

function TextInput({ label, onChange, type = 'text', value }: TextInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/10"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  )
}
EOF