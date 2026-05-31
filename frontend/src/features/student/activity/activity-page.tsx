import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import type { OrderStatus, OrderSummaryResponse } from '../../../client'
import { getOrdersByStudentOrdersGetOptions } from '../../../client/@tanstack/react-query.gen'
import { formatRupiah } from '../browse/format'
import { StudentAppShell, StudentTopHeader } from '../layout'
import type { ActivityStatusFilter } from './activity-status'

const ACTIVITY_STATUS_OPTIONS = [
  {
    label: 'Semua',
    value: undefined,
  },
  {
    label: 'Pembayaran',
    value: 'pending',
  },
  {
    label: 'Konfirmasi',
    value: 'waiting_for_confirmation',
  },
  {
    label: 'Diproses',
    value: 'in_process',
  },
  {
    label: 'Selesai',
    value: 'completed',
  },
] satisfies Array<{
  label: string
  value: ActivityStatusFilter
}>

type ActivityPageProps = {
  onStatusChange: (status: ActivityStatusFilter) => void
  status: ActivityStatusFilter
}

export function ActivityPage({ onStatusChange, status }: ActivityPageProps) {
  const ordersQuery = useQuery(
    getOrdersByStudentOrdersGetOptions({
      query: {
        page: 1,
        pageSize: 20,
        status: status ?? null,
      },
    }),
  )
  const orders = ordersQuery.data?.data ?? []

  return (
    <StudentAppShell>
      <StudentTopHeader subtitle="Riwayat transaksi Anda" title="Aktivitas" />
      <div className="border-b border-slate-200 px-4 py-2">
        <div className="grid grid-cols-3 gap-2">
          {ACTIVITY_STATUS_OPTIONS.slice(0, 3).map((option) => (
            <ActivityStatusButton
              isActive={status === option.value}
              key={option.label}
              label={option.label}
              onClick={() => onStatusChange(option.value)}
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {ACTIVITY_STATUS_OPTIONS.slice(3).map((option) => (
            <ActivityStatusButton
              isActive={status === option.value}
              key={option.label}
              label={option.label}
              onClick={() => onStatusChange(option.value)}
            />
          ))}
        </div>
      </div>
      <section className="px-4 py-5">
        {ordersQuery.isPending ? <ActivityListSkeleton /> : null}

        {ordersQuery.isError ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              Aktivitas gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        ) : null}

        {ordersQuery.isSuccess && orders.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center">
            <p className="text-sm leading-5 text-slate-500">
              Belum ada aktivitas transaksi.
            </p>
          </div>
        ) : null}

        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : null}
      </section>
    </StudentAppShell>
  )
}

function ActivityStatusButton({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={[
        'h-8 rounded-lg text-xs font-medium leading-4 transition',
        isActive
          ? 'bg-[#1e40af] text-white'
          : 'text-slate-500 hover:bg-slate-100',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function OrderCard({ order }: { order: OrderSummaryResponse }) {
  const primaryItem = order.orderItems[0]
  const itemCount = order.orderItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  return (
    <Link
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
      params={{
        orderId: order.id,
      }}
      to="/orders/$orderId"
    >
      <div className="flex gap-3">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-slate-100 px-2 text-center text-xs leading-4 text-slate-400">
          Pesanan
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-5 text-slate-800">
            {primaryItem
              ? getOrderItemTitle(order)
              : `Pesanan #${order.id.slice(0, 8)}`}
          </h3>
          <p className="mt-1 text-xs leading-4 text-slate-500">
            {itemCount > 0 ? `${itemCount} item` : 'Tidak ada item'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
        <div className="min-w-0">
          <p className="text-sm leading-5 text-slate-800">
            Total: {formatRupiah(order.totalPrice)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={[
              'rounded-full px-2 py-1 text-xs leading-4',
              getOrderStatusClassName(order.status),
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {getOrderStatusLabel(order.status)}
          </span>
          <ChevronRight aria-hidden="true" className="size-5 text-slate-400" />
        </div>
      </div>
    </Link>
  )
}

function ActivityListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          className="rounded-lg border border-slate-200 bg-white p-4"
          key={index}
        >
          <div className="flex gap-3">
            <div className="size-16 animate-pulse rounded-md bg-slate-100" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-4 h-10 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

function getOrderItemTitle(order: OrderSummaryResponse) {
  const [primaryItem, ...otherItems] = order.orderItems

  if (!primaryItem) {
    return 'Pesanan'
  }

  if (otherItems.length === 0) {
    return primaryItem.productName
  }

  return `${primaryItem.productName} + ${otherItems.length} item lainnya`
}

function getOrderStatusLabel(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return 'Menunggu Pembayaran'
    case 'waiting_for_confirmation':
      return 'Menunggu Konfirmasi'
    case 'in_process':
      return 'Diproses'
    case 'ready_to_pickup':
      return 'Siap Diambil'
    case 'completed':
      return 'Selesai'
    case 'rejected':
      return 'Ditolak'
    case 'failed':
      return 'Gagal'
  }
}

function getOrderStatusClassName(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'waiting_for_confirmation':
      return 'bg-orange-100 text-orange-800'
    case 'in_process':
    case 'ready_to_pickup':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-slate-100 text-slate-800'
    case 'rejected':
    case 'failed':
      return 'bg-red-100 text-red-800'
  }
}
