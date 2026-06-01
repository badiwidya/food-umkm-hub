import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, MessageSquare, Star, X } from 'lucide-react'
import { useState } from 'react'

import type {
  OrderDetailResponse,
  OrderItemResponse,
  OrderStatus,
  OrderSummaryResponse,
  ReviewItemRequest,
} from '../../../client'
import {
  cancelOrderOrdersIdCancelPostMutation,
  createOrderReviewsOrdersIdReviewsPostMutation,
  getOrderDetailsOrdersIdGetOptions,
  getOrdersByStudentOrdersGetOptions,
  getProductDetailsProductsIdGetOptions,
  getProductReviewsProductsIdReviewsGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import { ConfirmationDialog } from '../../../components/common/confirmation-dialog'
import { formatRupiah } from '../browse/format'
import { StudentTopHeader } from '../layout'
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
  const queryClient = useQueryClient()
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null)
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const ordersQuery = useQuery(
    getOrdersByStudentOrdersGetOptions({
      query: {
        page: 1,
        pageSize: 20,
        status: status ?? null,
      },
    }),
  )
  const cancelOrderMutation = useMutation(
    cancelOrderOrdersIdCancelPostMutation(),
  )
  const orders = ordersQuery.data?.data ?? []

  async function handleCancelOrder(orderId: string) {
    setCancelError(null)

    try {
      await cancelOrderMutation.mutateAsync({
        path: {
          id: orderId,
        },
      })
      await invalidateOrderQueries(queryClient, orderId)
      setCancelOrderId(null)
    } catch (error) {
      setCancelError(getErrorMessage(error))
      setCancelOrderId(null)
    }
  }

  return (
    <>
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

        {cancelError ? (
          <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm leading-5 text-red-700">{cancelError}</p>
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
              <OrderCard
                isCancelPending={
                  cancelOrderMutation.isPending &&
                  cancelOrderMutation.variables?.path.id === order.id
                }
                key={order.id}
                onCancelClick={() => setCancelOrderId(order.id)}
                onReviewClick={() => setReviewOrderId(order.id)}
                order={order}
              />
            ))}
          </div>
        ) : null}
      </section>
      {reviewOrderId ? (
        <ReviewOrderModal
          key={reviewOrderId}
          onClose={() => setReviewOrderId(null)}
          onSuccess={() => {
            setReviewOrderId(null)
          }}
          orderId={reviewOrderId}
        />
      ) : null}
      {cancelOrderId ? (
        <ConfirmationDialog
          confirmLabel="Batalkan"
          description="Pesanan yang dibatalkan tidak dapat diproses."
          isPending={cancelOrderMutation.isPending}
          onClose={() => setCancelOrderId(null)}
          onConfirm={() => {
            void handleCancelOrder(cancelOrderId)
          }}
          title="Batalkan pesanan ini?"
          variant="destructive"
        />
      ) : null}
    </>
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

function OrderCard({
  isCancelPending,
  onCancelClick,
  onReviewClick,
  order,
}: {
  isCancelPending: boolean
  onCancelClick: () => void
  onReviewClick: () => void
  order: OrderSummaryResponse
}) {
  const primaryItem = order.orderItems[0]
  const itemCount = order.orderItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )
  const canCancel = order.status === 'pending'
  const canReview = order.status === 'completed' && !order.isReviewed

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <Link
        className="block"
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
            <ChevronRight
              aria-hidden="true"
              className="size-5 text-slate-400"
            />
          </div>
        </div>
      </Link>
      {canCancel ? (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <button
            className="h-10 w-full rounded-lg bg-red-600 px-4 text-sm font-medium leading-5 text-white transition hover:bg-red-700 disabled:opacity-50"
            disabled={isCancelPending}
            onClick={onCancelClick}
            type="button"
          >
            {isCancelPending ? 'Membatalkan...' : 'Batalkan'}
          </button>
        </div>
      ) : null}
      {canReview ? (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <button
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c]"
            onClick={onReviewClick}
            type="button"
          >
            <MessageSquare aria-hidden="true" className="size-4" />
            Beri Ulasan
          </button>
        </div>
      ) : null}
    </article>
  )
}

type ReviewDraft = {
  comment: string
  rating: number | null
}

function ReviewOrderModal({
  onClose,
  onSuccess,
  orderId,
}: {
  onClose: () => void
  onSuccess: (orderId: string) => void
  orderId: string
}) {
  const queryClient = useQueryClient()
  const orderQuery = useQuery({
    ...getOrderDetailsOrdersIdGetOptions({
      path: {
        id: orderId,
      },
    }),
    enabled: orderId.length > 0,
  })
  const createReviewsMutation = useMutation(
    createOrderReviewsOrdersIdReviewsPostMutation(),
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({})
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const order = orderQuery.data
  const reviewableItems = order ? getReviewableOrderItems(order) : []
  const activeItem = reviewableItems[activeIndex]
  const activeDraft = activeItem
    ? (drafts[activeItem.productId] ?? createEmptyReviewDraft())
    : createEmptyReviewDraft()
  const canMovePrevious = activeIndex > 0
  const canMoveNext = activeIndex < reviewableItems.length - 1

  function updateActiveDraft(nextDraft: Partial<ReviewDraft>) {
    if (!activeItem) {
      return
    }

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [activeItem.productId]: {
        ...createEmptyReviewDraft(),
        ...currentDrafts[activeItem.productId],
        ...nextDraft,
      },
    }))
    setValidationMessage(null)
    setSubmitError(null)
  }

  async function handleSubmit() {
    if (!order) {
      return
    }

    const firstMissingRatingIndex = reviewableItems.findIndex((item) => {
      const draft = drafts[item.productId]
      return draft?.rating === null || draft?.rating === undefined
    })

    if (firstMissingRatingIndex >= 0) {
      setActiveIndex(firstMissingRatingIndex)
      setValidationMessage('Rating wajib diisi untuk semua produk.')
      return
    }

    const reviews = buildReviewPayload(reviewableItems, drafts)

    if (!reviews) {
      setValidationMessage('Rating wajib diisi untuk semua produk.')
      return
    }

    try {
      await createReviewsMutation.mutateAsync({
        body: {
          reviews,
        },
        path: {
          id: order.id,
        },
      })

      await invalidateReviewQueries(queryClient, order, reviewableItems)
      onSuccess(order.id)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    }
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/50"
      onClick={createReviewsMutation.isPending ? undefined : onClose}
      role="dialog"
    >
      <div
        className="max-h-[85vh] w-full max-w-sm overflow-hidden rounded-t-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-medium leading-7 text-slate-800">
            Beri Ulasan
          </h2>
          <button
            aria-label="Tutup ulasan"
            className="flex size-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
            disabled={createReviewsMutation.isPending}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="max-h-[calc(85vh-65px)] overflow-y-auto">
          {orderQuery.isPending ? (
            <ReviewModalSkeleton />
          ) : orderQuery.isError ? (
            <ReviewModalMessage message="Detail pesanan gagal dimuat. Coba muat ulang halaman." />
          ) : order && order.status !== 'completed' ? (
            <ReviewModalMessage message="Ulasan hanya dapat diberikan untuk pesanan selesai." />
          ) : order?.isReviewed ? (
            <ReviewModalMessage message="Pesanan ini sudah diberi ulasan." />
          ) : reviewableItems.length === 0 ? (
            <ReviewModalMessage message="Tidak ada produk yang dapat diulas." />
          ) : activeItem ? (
            <div className="px-4 py-4">
              <div className="space-y-1">
                <p className="text-sm leading-5 text-slate-500">
                  Pesanan #{orderId.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm font-medium leading-5 text-slate-800">
                  {activeItem.productName}
                </p>
                <p className="text-xs leading-4 text-slate-500">
                  {activeIndex + 1} / {reviewableItems.length}
                </p>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium leading-5 text-slate-800">
                  Berikan Rating
                </p>
                <StarRatingInput
                  onChange={(rating) => updateActiveDraft({ rating })}
                  value={activeDraft.rating}
                />
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-medium leading-5 text-slate-800">
                  Ulasan (Opsional)
                </span>
                <textarea
                  className="mt-3 min-h-28 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white"
                  maxLength={500}
                  onChange={(event) =>
                    updateActiveDraft({ comment: event.target.value })
                  }
                  placeholder="Ceritakan pengalaman Anda dengan pesanan ini..."
                  value={activeDraft.comment}
                />
              </label>
              <p className="mt-2 text-xs leading-4 text-slate-500">
                {activeDraft.comment.length}/500 karakter
              </p>

              {validationMessage ? (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
                  {validationMessage}
                </p>
              ) : null}

              {submitError ? (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
                  {submitError}
                </p>
              ) : null}

              <div className="mt-6 grid grid-cols-2 gap-3">
                {canMovePrevious ? (
                  <button
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                    disabled={createReviewsMutation.isPending}
                    onClick={() =>
                      setActiveIndex((currentIndex) =>
                        Math.max(0, currentIndex - 1),
                      )
                    }
                    type="button"
                  >
                    <ChevronLeft aria-hidden="true" className="size-4" />
                    Sebelumnya
                  </button>
                ) : (
                  <button
                    className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                    disabled={createReviewsMutation.isPending}
                    onClick={onClose}
                    type="button"
                  >
                    Batal
                  </button>
                )}
                {canMoveNext ? (
                  <button
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c] disabled:opacity-50"
                    disabled={createReviewsMutation.isPending}
                    onClick={() =>
                      setActiveIndex((currentIndex) =>
                        Math.min(reviewableItems.length - 1, currentIndex + 1),
                      )
                    }
                    type="button"
                  >
                    Lanjut
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </button>
                ) : (
                  <button
                    className="h-11 rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c] disabled:opacity-50"
                    disabled={createReviewsMutation.isPending}
                    onClick={() => {
                      void handleSubmit()
                    }}
                    type="button"
                  >
                    {createReviewsMutation.isPending
                      ? 'Mengirim...'
                      : 'Kirim Ulasan'}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function StarRatingInput({
  onChange,
  value,
}: {
  onChange: (rating: number) => void
  value: number | null
}) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1
        const isSelected = value !== null && rating <= value

        return (
          <button
            aria-label={`${rating} bintang`}
            className="flex size-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-amber-50 hover:text-amber-400"
            key={rating}
            onClick={() => onChange(rating)}
            type="button"
          >
            <Star
              aria-hidden="true"
              className={[
                'size-8',
                isSelected ? 'text-amber-400' : 'text-slate-300',
              ]
                .filter(Boolean)
                .join(' ')}
              fill={isSelected ? 'currentColor' : 'none'}
            />
          </button>
        )
      })}
    </div>
  )
}

function ReviewModalSkeleton() {
  return (
    <div className="space-y-5 px-4 py-4">
      <div className="space-y-2">
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-16 animate-pulse rounded bg-slate-100" />
      <div className="h-28 animate-pulse rounded bg-slate-100" />
      <div className="h-11 animate-pulse rounded bg-slate-100" />
    </div>
  )
}

function ReviewModalMessage({ message }: { message: string }) {
  return (
    <div className="px-4 py-5">
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm leading-5 text-slate-600">
        {message}
      </p>
    </div>
  )
}

function createEmptyReviewDraft(): ReviewDraft {
  return {
    comment: '',
    rating: null,
  }
}

function getReviewableOrderItems(order: OrderDetailResponse) {
  const seenProductIds = new Set<string>()
  const reviewableItems: OrderItemResponse[] = []

  for (const item of order.orderItems) {
    if (seenProductIds.has(item.productId)) {
      continue
    }

    seenProductIds.add(item.productId)
    reviewableItems.push(item)
  }

  return reviewableItems
}

function buildReviewPayload(
  items: OrderItemResponse[],
  drafts: Record<string, ReviewDraft>,
) {
  const reviews: ReviewItemRequest[] = []

  for (const item of items) {
    const draft = drafts[item.productId]

    if (!draft || draft.rating === null) {
      return null
    }

    const comment = draft.comment.trim()

    reviews.push({
      comment: comment.length > 0 ? comment : null,
      productId: item.productId,
      rating: draft.rating,
    })
  }

  return reviews
}

async function invalidateReviewQueries(
  queryClient: QueryClient,
  order: OrderDetailResponse,
  items: OrderItemResponse[],
) {
  await Promise.all([
    queryClient.invalidateQueries({
      predicate: (query) =>
        getGeneratedQueryId(query.queryKey) === 'getOrdersByStudentOrdersGet',
    }),
    queryClient.invalidateQueries({
      queryKey: getOrderDetailsOrdersIdGetOptions({
        path: {
          id: order.id,
        },
      }).queryKey,
    }),
    ...items.flatMap((item) => [
      queryClient.invalidateQueries({
        queryKey: getProductDetailsProductsIdGetOptions({
          path: {
            id: item.productId,
          },
        }).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: getProductReviewsProductsIdReviewsGetOptions({
          path: {
            id: item.productId,
          },
          query: {
            page: 1,
            pageSize: 5,
          },
        }).queryKey,
      }),
    ]),
  ])
}

async function invalidateOrderQueries(
  queryClient: QueryClient,
  orderId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      predicate: (query) =>
        getGeneratedQueryId(query.queryKey) === 'getOrdersByStudentOrdersGet',
    }),
    queryClient.invalidateQueries({
      queryKey: getOrderDetailsOrdersIdGetOptions({
        path: {
          id: orderId,
        },
      }).queryKey,
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

function getErrorMessage(error: unknown) {
  if (hasStringMessage(error)) {
    return error.message
  }

  return 'Ulasan gagal dikirim. Coba lagi.'
}

function hasStringMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
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
