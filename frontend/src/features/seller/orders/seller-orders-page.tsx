import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ReceiptText,
  X,
} from 'lucide-react'
import { useState } from 'react'

import type {
  ErrorResponse,
  OrderDetailResponse,
  OrderStatus,
  OrderSummaryResponse,
  PaymentMethod,
} from '../../../client'
import {
  acceptOrderStoresMeOrdersIdAcceptPostMutation,
  completeOrderStoresMeOrdersIdCompletePostMutation,
  getAllActiveStoresMeOrdersActiveGetOptions,
  getAllSellerStoresMeOrdersGetOptions,
  getMyDashboardStoresMeDashboardGetOptions,
  markOrderAsReadyToPickupStoresMeOrdersIdReadyPostMutation,
  rejectOrderStoresMeOrdersIdRejectPostMutation,
} from '../../../client/@tanstack/react-query.gen'
import { formatRupiah } from '../dashboard/format'

type SellerOrdersTab = 'berjalan' | 'riwayat'
type SellerOrderHistoryStatus = Extract<
  OrderStatus,
  'completed' | 'failed' | 'rejected'
>

type SellerOrdersPageProps = {
  onHistoryPageChange: (page: number) => void
  onHistoryStatusChange: (status: SellerOrderHistoryStatus | undefined) => void
  onTabChange: (tab: SellerOrdersTab) => void
  page: number
  status: SellerOrderHistoryStatus | undefined
  tab: SellerOrdersTab
}

const HISTORY_PAGE_SIZE = 20

const ACTIVE_ORDER_TABS = [
  {
    getOrders: (orders: ActiveOrders) => orders.waitingForConfirmation,
    key: 'waitingForConfirmation',
    status: 'waiting_for_confirmation',
    title: 'Menunggu Konfirmasi',
  },
  {
    getOrders: (orders: ActiveOrders) => orders.inProcess,
    key: 'inProcess',
    status: 'in_process',
    title: 'Diproses',
  },
  {
    getOrders: (orders: ActiveOrders) => orders.readyToPickup,
    key: 'readyToPickup',
    status: 'ready_to_pickup',
    title: 'Siap Diambil',
  },
] satisfies Array<{
  getOrders: (orders: ActiveOrders) => Array<OrderDetailResponse>
  key: string
  status: OrderStatus
  title: string
}>

type ActiveOrderStatus = (typeof ACTIVE_ORDER_TABS)[number]['status']

const HISTORY_STATUS_OPTIONS = [
  {
    label: 'Semua',
    value: undefined,
  },
  {
    label: 'Selesai',
    value: 'completed',
  },
  {
    label: 'Ditolak',
    value: 'rejected',
  },
  {
    label: 'Gagal',
    value: 'failed',
  },
] satisfies Array<{
  label: string
  value: SellerOrderHistoryStatus | undefined
}>

type ActiveOrders = {
  inProcess: Array<OrderDetailResponse>
  readyToPickup: Array<OrderDetailResponse>
  waitingForConfirmation: Array<OrderDetailResponse>
}

type PendingOrderAction = {
  action: 'accept' | 'complete' | 'ready' | 'reject'
  orderId: string
} | null

export function SellerOrdersPage({
  onHistoryPageChange,
  onHistoryStatusChange,
  onTabChange,
  page,
  status,
  tab,
}: SellerOrdersPageProps) {
  return (
    <>
      <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-medium leading-7">Pesanan</h1>
            <p className="mt-1 truncate text-sm leading-5 text-white/80">
              Kelola pesanan toko
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <ReceiptText aria-hidden="true" className="size-6" />
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          <SellerOrdersTabButton
            isActive={tab === 'berjalan'}
            label="Berjalan"
            onClick={() => onTabChange('berjalan')}
          />
          <SellerOrdersTabButton
            isActive={tab === 'riwayat'}
            label="Riwayat"
            onClick={() => onTabChange('riwayat')}
          />
        </div>
      </div>

      {tab === 'berjalan' ? <ActiveOrdersTab /> : null}
      {tab === 'riwayat' ? (
        <HistoryOrdersTab
          onPageChange={onHistoryPageChange}
          onStatusChange={onHistoryStatusChange}
          page={page}
          status={status}
        />
      ) : null}
    </>
  )
}

function SellerOrdersTabButton({
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
        'h-9 rounded-md text-sm font-medium leading-5 transition',
        isActive
          ? 'bg-white text-[#1e40af] shadow-sm'
          : 'text-slate-500 hover:text-slate-700',
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function ActiveOrdersTab() {
  const queryClient = useQueryClient()
  const [activeStatus, setActiveStatus] = useState<ActiveOrderStatus>(
    'waiting_for_confirmation',
  )
  const [pendingAction, setPendingAction] = useState<PendingOrderAction>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [rejectOrder, setRejectOrder] = useState<OrderDetailResponse | null>(
    null,
  )
  const [detailOrder, setDetailOrder] = useState<OrderDetailResponse | null>(
    null,
  )
  const activeOrdersQuery = useQuery(
    getAllActiveStoresMeOrdersActiveGetOptions(),
  )
  const acceptOrderMutation = useMutation(
    acceptOrderStoresMeOrdersIdAcceptPostMutation(),
  )
  const rejectOrderMutation = useMutation(
    rejectOrderStoresMeOrdersIdRejectPostMutation(),
  )
  const readyOrderMutation = useMutation(
    markOrderAsReadyToPickupStoresMeOrdersIdReadyPostMutation(),
  )
  const completeOrderMutation = useMutation(
    completeOrderStoresMeOrdersIdCompletePostMutation(),
  )
  const activeOrders = activeOrdersQuery.data
  const totalActiveOrders = activeOrders
    ? activeOrders.waitingForConfirmation.length +
      activeOrders.inProcess.length +
      activeOrders.readyToPickup.length
    : 0
  const activeTab = ACTIVE_ORDER_TABS.find(
    (tabItem) => tabItem.status === activeStatus,
  )
  const visibleOrders =
    activeOrders && activeTab ? activeTab.getOrders(activeOrders) : []

  async function handleOrderAction(
    action: NonNullable<PendingOrderAction>['action'],
    orderId: string,
    reason?: string,
  ) {
    if (pendingAction) {
      return
    }

    setActionError(null)
    setPendingAction({
      action,
      orderId,
    })

    try {
      if (action === 'accept') {
        await acceptOrderMutation.mutateAsync({
          path: {
            id: orderId,
          },
        })
      }

      if (action === 'reject') {
        await rejectOrderMutation.mutateAsync({
          body: {
            reason: reason ?? '',
          },
          path: {
            id: orderId,
          },
        })
        setRejectOrder(null)
      }

      if (action === 'ready') {
        await readyOrderMutation.mutateAsync({
          path: {
            id: orderId,
          },
        })
      }

      if (action === 'complete') {
        await completeOrderMutation.mutateAsync({
          path: {
            id: orderId,
          },
        })
      }

      await invalidateSellerOrderQueries(queryClient)
      setDetailOrder(null)
    } catch (error) {
      setActionError(getOrderActionErrorMessage(error, action))
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <>
      <section className="space-y-4 px-4 py-5">
        {actionError ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm leading-5 text-red-700">{actionError}</p>
          </div>
        ) : null}

        {activeOrdersQuery.isPending ? <ActiveOrdersSkeleton /> : null}

        {activeOrdersQuery.isError ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              Pesanan berjalan gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        ) : null}

        {activeOrders && totalActiveOrders === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center">
            <ClipboardCheck
              aria-hidden="true"
              className="mx-auto size-8 text-slate-300"
            />
            <p className="mt-3 text-sm leading-5 text-slate-500">
              Belum ada pesanan berjalan.
            </p>
          </div>
        ) : null}

        {activeOrders && totalActiveOrders > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVE_ORDER_TABS.map((tabItem) => (
                <ActiveStatusTabButton
                  count={tabItem.getOrders(activeOrders).length}
                  isActive={activeStatus === tabItem.status}
                  key={tabItem.key}
                  label={tabItem.title}
                  onClick={() => setActiveStatus(tabItem.status)}
                />
              ))}
            </div>

            {visibleOrders.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center">
                <p className="text-sm leading-5 text-slate-500">
                  Tidak ada pesanan pada status ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleOrders.map((order) => (
                  <SellerActiveOrderCard
                    key={order.id}
                    onAccept={() => {
                      void handleOrderAction('accept', order.id)
                    }}
                    onComplete={() => {
                      void handleOrderAction('complete', order.id)
                    }}
                    onDetail={() => setDetailOrder(order)}
                    onReady={() => {
                      void handleOrderAction('ready', order.id)
                    }}
                    onReject={() => setRejectOrder(order)}
                    order={order}
                    pendingAction={pendingAction}
                    sectionStatus={activeStatus}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </section>

      {detailOrder ? (
        <OrderDetailSheet
          isActionPending={pendingAction?.orderId === detailOrder.id}
          onAccept={() => {
            void handleOrderAction('accept', detailOrder.id)
          }}
          onClose={() => setDetailOrder(null)}
          onComplete={() => {
            void handleOrderAction('complete', detailOrder.id)
          }}
          onReady={() => {
            void handleOrderAction('ready', detailOrder.id)
          }}
          onReject={() => {
            setDetailOrder(null)
            setRejectOrder(detailOrder)
          }}
          order={detailOrder}
          pendingAction={pendingAction}
        />
      ) : null}

      {rejectOrder ? (
        <RejectOrderDialog
          errorMessage={
            pendingAction?.action === 'reject' ? actionError : undefined
          }
          isPending={
            pendingAction?.action === 'reject' &&
            pendingAction.orderId === rejectOrder.id
          }
          onClose={() => setRejectOrder(null)}
          onConfirm={(reason) => {
            void handleOrderAction('reject', rejectOrder.id, reason)
          }}
          order={rejectOrder}
        />
      ) : null}
    </>
  )
}

function ActiveStatusTabButton({
  count,
  isActive,
  label,
  onClick,
}: {
  count: number
  isActive: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={[
        'min-h-14 rounded-lg px-2 py-2 text-center transition',
        isActive ? 'bg-[#1e40af] text-white' : 'bg-white text-slate-500',
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      <span className="block text-xs font-medium leading-4">{label}</span>
      <span
        className={[
          'mt-1 inline-flex rounded-full px-2 py-0.5 text-xs leading-4',
          isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500',
        ].join(' ')}
      >
        {count}
      </span>
    </button>
  )
}

function SellerActiveOrderCard({
  onAccept,
  onComplete,
  onDetail,
  onReady,
  onReject,
  order,
  pendingAction,
  sectionStatus,
}: {
  onAccept: () => void
  onComplete: () => void
  onDetail: () => void
  onReady: () => void
  onReject: () => void
  order: OrderDetailResponse
  pendingAction: PendingOrderAction
  sectionStatus: OrderStatus
}) {
  const isThisOrderPending = pendingAction?.orderId === order.id
  const isDisabled = Boolean(pendingAction)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <CompactOrderCardContent order={order} />

      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
        <button
          className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50"
          onClick={onDetail}
          type="button"
        >
          Detail
        </button>

        {sectionStatus === 'waiting_for_confirmation' ? (
          <>
            <button
              className="h-9 flex-1 rounded-lg border border-red-200 px-3 text-sm font-medium leading-5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDisabled}
              onClick={onReject}
              type="button"
            >
              Tolak
            </button>
            <button
              className="h-9 flex-1 rounded-lg bg-[#1e40af] px-3 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDisabled}
              onClick={onAccept}
              type="button"
            >
              {isThisOrderPending && pendingAction?.action === 'accept'
                ? 'Menerima...'
                : 'Terima'}
            </button>
          </>
        ) : null}

        {sectionStatus === 'in_process' ? (
          <button
            className="h-9 flex-[2] rounded-lg bg-[#1e40af] px-3 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDisabled}
            onClick={onReady}
            type="button"
          >
            {isThisOrderPending && pendingAction?.action === 'ready'
              ? 'Memperbarui...'
              : 'Tandai Siap Diambil'}
          </button>
        ) : null}

        {sectionStatus === 'ready_to_pickup' ? (
          <button
            className="h-9 flex-[2] rounded-lg bg-[#1e40af] px-3 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDisabled}
            onClick={onComplete}
            type="button"
          >
            {isThisOrderPending && pendingAction?.action === 'complete'
              ? 'Menyelesaikan...'
              : 'Selesaikan'}
          </button>
        ) : null}
      </div>
    </article>
  )
}

function CompactOrderCardContent({
  order,
}: {
  order: OrderDetailResponse | OrderSummaryResponse
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs leading-4 text-slate-500">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <h3 className="mt-1 line-clamp-1 text-sm font-medium leading-5 text-slate-800">
            {getOrderItemTitle(order)}
          </h3>
        </div>
        <span
          className={[
            'shrink-0 rounded-full px-2 py-1 text-xs leading-4',
            getOrderStatusClassName(order.status),
          ].join(' ')}
        >
          {getOrderStatusLabel(order.status)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs leading-4">
        <div className="min-w-0">
          <p className="text-slate-500">Total</p>
          <p className="truncate text-sm leading-5 text-[#1e40af]">
            {formatRupiah(order.totalPrice)}
          </p>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-slate-500">Pembayaran</p>
          <p className="truncate text-sm leading-5 text-slate-800">
            {getPaymentMethodLabel(order.paymentMethod)}
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs leading-4 text-slate-500">
        {getOrderItemCount(order)} item - {formatDateTime(order.createdAt)}
      </p>

      {'notes' in order && order.notes ? (
        <p className="mt-2 truncate rounded-md bg-slate-50 px-2 py-1 text-xs leading-4 text-slate-500">
          Catatan: {order.notes}
        </p>
      ) : null}
    </>
  )
}

function HistoryOrdersTab({
  onPageChange,
  onStatusChange,
  page,
  status,
}: {
  onPageChange: (page: number) => void
  onStatusChange: (status: SellerOrderHistoryStatus | undefined) => void
  page: number
  status: SellerOrderHistoryStatus | undefined
}) {
  const historyOrdersQuery = useQuery(
    getAllSellerStoresMeOrdersGetOptions({
      query: {
        page,
        pageSize: HISTORY_PAGE_SIZE,
        status: status ?? null,
      },
    }),
  )
  const orders = historyOrdersQuery.data?.data ?? []
  const totalOrders = historyOrdersQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalOrders / HISTORY_PAGE_SIZE))
  const hasStatusFilter = Boolean(status)

  return (
    <section className="px-4 py-5">
      <div className="mb-4 grid grid-cols-4 gap-2">
        {HISTORY_STATUS_OPTIONS.map((option) => (
          <HistoryStatusButton
            isActive={status === option.value}
            key={option.label}
            label={option.label}
            onClick={() => onStatusChange(option.value)}
          />
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium leading-7 text-slate-800">
          Riwayat Pesanan
        </h2>
        <p className="shrink-0 text-sm leading-5 text-slate-500">
          {totalOrders} pesanan
        </p>
      </div>

      {historyOrdersQuery.isPending ? <HistoryOrdersSkeleton /> : null}

      {historyOrdersQuery.isError ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
          <p className="text-sm leading-5 text-red-700">
            Riwayat pesanan gagal dimuat. Coba muat ulang halaman.
          </p>
        </div>
      ) : null}

      {historyOrdersQuery.isSuccess && orders.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center">
          <p className="text-sm leading-5 text-slate-500">
            {hasStatusFilter
              ? 'Tidak ada riwayat pesanan yang sesuai.'
              : 'Belum ada riwayat pesanan.'}
          </p>
        </div>
      ) : null}

      {orders.length > 0 ? (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <SellerHistoryOrderCard key={order.id} order={order} />
            ))}
          </div>
          <HistoryPagination
            onPageChange={onPageChange}
            page={page}
            totalPages={totalPages}
          />
        </>
      ) : null}
    </section>
  )
}

function HistoryStatusButton({
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
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function SellerHistoryOrderCard({ order }: { order: OrderSummaryResponse }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <CompactOrderCardContent order={order} />
    </article>
  )
}

function OrderDetailSheet({
  isActionPending,
  onAccept,
  onClose,
  onComplete,
  onReady,
  onReject,
  order,
  pendingAction,
}: {
  isActionPending: boolean
  onAccept: () => void
  onClose: () => void
  onComplete: () => void
  onReady: () => void
  onReject: () => void
  order: OrderDetailResponse
  pendingAction: PendingOrderAction
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/50"
      role="dialog"
    >
      <div className="max-h-[85vh] w-full max-w-sm overflow-hidden rounded-t-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-medium leading-7 text-slate-800">
              Pesanan #{order.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className="mt-1 text-xs leading-4 text-slate-500">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <button
            aria-label="Tutup detail pesanan"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
            disabled={isActionPending}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="max-h-[calc(85vh-73px)] overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <span
              className={[
                'rounded-full px-2 py-1 text-xs leading-4',
                getOrderStatusClassName(order.status),
              ].join(' ')}
            >
              {getOrderStatusLabel(order.status)}
            </span>
            <p className="text-sm leading-5 text-[#1e40af]">
              {formatRupiah(order.totalPrice)}
            </p>
          </div>

          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-medium leading-5 text-slate-800">
              Detail Pesanan
            </h3>
            <div className="mt-3 space-y-3">
              {order.orderItems.map((item) => (
                <div
                  className="flex items-start justify-between gap-3 text-sm leading-5"
                  key={item.productId}
                >
                  <div className="min-w-0">
                    <p className="text-slate-800">{item.productName}</p>
                    <p className="text-xs leading-4 text-slate-500">
                      x{item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-[#1e40af]">
                    {formatRupiah(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
            {order.notes ? (
              <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="text-xs leading-4 text-slate-500">Catatan</p>
                <p className="mt-1 text-sm leading-5 text-slate-800">
                  {order.notes}
                </p>
              </div>
            ) : null}
          </section>

          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-medium leading-5 text-slate-800">
              Pembayaran
            </h3>
            <div className="mt-3 space-y-2 text-sm leading-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Metode</span>
                <span className="text-slate-800">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>
              {order.discountAmount > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-red-600">Diskon</span>
                  <span className="text-red-600">
                    - {formatRupiah(order.discountAmount)}
                  </span>
                </div>
              ) : null}
              {order.promoCode ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Promo</span>
                  <span className="font-mono text-xs text-slate-800">
                    {order.promoCode}
                  </span>
                </div>
              ) : null}
              <div className="border-t border-slate-200 pt-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-800">Total</span>
                  <span className="text-lg leading-7 text-[#1e40af]">
                    {formatRupiah(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {order.paymentProofUrl ? (
              <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="text-sm font-medium leading-5 text-slate-800">
                  Bukti Bayar
                </p>
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img
                    alt={`Bukti bayar pesanan #${order.id
                      .slice(0, 8)
                      .toUpperCase()}`}
                    className="max-h-96 w-full object-contain"
                    src={order.paymentProofUrl}
                  />
                </div>
              </div>
            ) : null}
          </section>

          {order.status === 'waiting_for_confirmation' ? (
            <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 bg-white py-4">
              <button
                className="h-11 rounded-lg border border-red-200 px-4 text-sm font-medium leading-5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isActionPending}
                onClick={onReject}
                type="button"
              >
                Tolak
              </button>
              <button
                className="h-11 rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isActionPending}
                onClick={onAccept}
                type="button"
              >
                {pendingAction?.action === 'accept' &&
                pendingAction.orderId === order.id
                  ? 'Menerima...'
                  : 'Terima'}
              </button>
            </div>
          ) : null}

          {order.status === 'in_process' ? (
            <div className="sticky bottom-0 mt-4 border-t border-slate-200 bg-white py-4">
              <button
                className="h-11 w-full rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isActionPending}
                onClick={onReady}
                type="button"
              >
                {pendingAction?.action === 'ready' &&
                pendingAction.orderId === order.id
                  ? 'Memperbarui...'
                  : 'Tandai Siap Diambil'}
              </button>
            </div>
          ) : null}

          {order.status === 'ready_to_pickup' ? (
            <div className="sticky bottom-0 mt-4 border-t border-slate-200 bg-white py-4">
              <button
                className="h-11 w-full rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isActionPending}
                onClick={onComplete}
                type="button"
              >
                {pendingAction?.action === 'complete' &&
                pendingAction.orderId === order.id
                  ? 'Menyelesaikan...'
                  : 'Selesaikan'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function HistoryPagination({
  onPageChange,
  page,
  totalPages,
}: {
  onPageChange: (page: number) => void
  page: number
  totalPages: number
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <button
        className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Sebelumnya
      </button>
      <p className="text-sm leading-5 text-slate-500">
        {page} / {totalPages}
      </p>
      <button
        className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        Berikutnya
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

function RejectOrderDialog({
  errorMessage,
  isPending,
  onClose,
  onConfirm,
  order,
}: {
  errorMessage?: string | null
  isPending: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  order: OrderDetailResponse
}) {
  const [reason, setReason] = useState('')
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  )

  function handleConfirm() {
    const trimmedReason = reason.trim()

    if (!trimmedReason) {
      setValidationMessage('Alasan penolakan wajib diisi.')
      return
    }

    setValidationMessage(null)
    onConfirm(trimmedReason)
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 px-4 pb-4"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
        <h3 className="text-base font-medium leading-6 text-slate-900">
          Tolak pesanan #{order.id.slice(0, 8).toUpperCase()}?
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Berikan alasan agar pelanggan memahami kenapa pesanan ditolak.
        </p>
        <label className="mt-4 block">
          <span className="text-sm font-medium leading-5 text-slate-800">
            Alasan Penolakan
          </span>
          <textarea
            className="mt-2 min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white"
            disabled={isPending}
            onChange={(event) => {
              setReason(event.target.value)
              setValidationMessage(null)
            }}
            placeholder="Contoh: Produk sedang habis."
            value={reason}
          />
        </label>
        {validationMessage || errorMessage ? (
          <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
            <p className="text-sm leading-5 text-red-700">
              {validationMessage ?? errorMessage}
            </p>
          </div>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="h-11 rounded-lg bg-red-600 px-4 text-sm font-medium leading-5 text-white transition hover:bg-red-700 disabled:opacity-50"
            disabled={isPending}
            onClick={handleConfirm}
            type="button"
          >
            {isPending ? 'Menolak...' : 'Tolak'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ActiveOrdersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="h-14 animate-pulse rounded-lg bg-slate-100"
            key={index}
          />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

function HistoryOrdersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <OrderCardSkeleton key={index} />
      ))}
    </div>
  )
}

function OrderCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="h-8 animate-pulse rounded bg-slate-100" />
        <div className="h-8 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3">
        <div className="h-9 flex-1 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-9 flex-1 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  )
}

async function invalidateSellerOrderQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: getAllActiveStoresMeOrdersActiveGetOptions().queryKey,
    }),
    queryClient.invalidateQueries({
      predicate: (query) =>
        getGeneratedQueryId(query.queryKey) === 'getAllSellerStoresMeOrdersGet',
    }),
    queryClient.invalidateQueries({
      queryKey: getMyDashboardStoresMeDashboardGetOptions().queryKey,
    }),
  ])
}

function getGeneratedQueryId(queryKey: readonly unknown[]) {
  const firstQueryKeyPart = queryKey[0]

  if (!isGeneratedQueryKeyPart(firstQueryKeyPart)) {
    return null
  }

  return firstQueryKeyPart._id
}

function isGeneratedQueryKeyPart(value: unknown): value is { _id: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    typeof value._id === 'string'
  )
}

function getOrderItemTitle(order: OrderDetailResponse | OrderSummaryResponse) {
  const [primaryItem, ...otherItems] = order.orderItems

  if (!primaryItem) {
    return 'Pesanan'
  }

  if (otherItems.length === 0) {
    return primaryItem.productName
  }

  return `${primaryItem.productName} + ${otherItems.length} item lainnya`
}

function getOrderItemCount(order: OrderDetailResponse | OrderSummaryResponse) {
  return order.orderItems.reduce((total, item) => total + item.quantity, 0)
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

function getPaymentMethodLabel(paymentMethod: PaymentMethod) {
  switch (paymentMethod) {
    case 'cash':
      return 'Bayar di Tempat'
    case 'qris':
      return 'QRIS'
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getOrderActionErrorMessage(
  error: unknown,
  action: NonNullable<PendingOrderAction>['action'],
) {
  if (isErrorResponse(error) && error.message) {
    return error.message
  }

  switch (action) {
    case 'accept':
      return 'Pesanan gagal diterima. Coba lagi.'
    case 'reject':
      return 'Pesanan gagal ditolak. Coba lagi.'
    case 'ready':
      return 'Status pesanan gagal diperbarui. Coba lagi.'
    case 'complete':
      return 'Pesanan gagal diselesaikan. Coba lagi.'
  }
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  )
}
