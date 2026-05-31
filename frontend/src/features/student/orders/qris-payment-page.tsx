import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Clock, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { ErrorResponse, ValidationErrorResponse } from '../../../client'
import {
  getDetailStoresIdGetOptions,
  getOrderDetailsOrdersIdGetOptions,
  getOrderDetailsOrdersIdGetQueryKey,
  getOrdersByStudentOrdersGetQueryKey,
  updatePaymentProofOrdersIdPaymentProofPostMutation,
} from '../../../client/@tanstack/react-query.gen'
import { formatRupiah } from '../browse/format'
import {
  uploadPaymentProof,
  validatePaymentProofFile,
} from './payment-proof-upload'

const QRIS_PAYMENT_WINDOW_MS = 2 * 60 * 1000

type QrisPaymentPageProps = {
  orderId: string
}

export function QrisPaymentPage({ orderId }: QrisPaymentPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofError, setPaymentProofError] = useState<string | null>(
    null,
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const orderQuery = useQuery(
    getOrderDetailsOrdersIdGetOptions({
      path: {
        id: orderId,
      },
    }),
  )
  const order = orderQuery.data
  const storeQuery = useQuery({
    ...getDetailStoresIdGetOptions({
      path: {
        id: order?.storeId ?? '',
      },
    }),
    enabled: order !== undefined,
  })
  const store = storeQuery.data
  const updatePaymentProofMutation = useMutation(
    updatePaymentProofOrdersIdPaymentProofPostMutation(),
  )
  const isPending = updatePaymentProofMutation.isPending
  const remainingMs = order
    ? getRemainingPaymentMs(order.createdAt, now)
    : QRIS_PAYMENT_WINDOW_MS
  const isExpired = remainingMs <= 0

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  function handlePaymentProofChange(file: File | null) {
    setSubmitError(null)

    if (!file) {
      setPaymentProofFile(null)
      setPaymentProofError(null)
      return
    }

    const validationError = validatePaymentProofFile(file)

    if (validationError) {
      setPaymentProofFile(null)
      setPaymentProofError(validationError)
      return
    }

    setPaymentProofFile(file)
    setPaymentProofError(null)
  }

  async function handleSubmit() {
    setSubmitError(null)
    setPaymentProofError(null)

    if (!paymentProofFile) {
      setPaymentProofError('Upload bukti pembayaran terlebih dahulu.')
      return
    }

    if (isExpired) {
      setSubmitError('Waktu pembayaran QRIS sudah berakhir.')
      return
    }

    try {
      const paymentProofUrl = await uploadPaymentProof(paymentProofFile)
      const updatedOrder = await updatePaymentProofMutation.mutateAsync({
        body: {
          paymentProofUrl,
        },
        path: {
          id: orderId,
        },
      })

      queryClient.setQueryData(
        getOrderDetailsOrdersIdGetQueryKey({
          path: {
            id: orderId,
          },
        }),
        updatedOrder,
      )
      await queryClient.invalidateQueries({
        queryKey: getOrdersByStudentOrdersGetQueryKey(),
      })
      await navigate({
        params: {
          orderId,
        },
        to: '/orders/$orderId/success',
      })
    } catch (error) {
      setSubmitError(
        getPaymentErrorMessage(
          error,
          'Bukti pembayaran gagal diupload. Coba lagi.',
        ),
      )
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col bg-white">
        <header className="sticky top-0 z-10 bg-[#1e40af] px-3 py-2 text-white">
          <div className="flex h-10 items-center gap-3">
            <Link
              aria-label="Kembali"
              className="flex size-10 items-center justify-center rounded-full transition hover:bg-white/10"
              params={{ orderId }}
              to="/orders/$orderId"
            >
              <ArrowLeft aria-hidden="true" className="size-6" />
            </Link>
            <h1 className="text-xl font-medium leading-7">Pembayaran QRIS</h1>
          </div>
        </header>

        <section className="flex-1 space-y-4 px-4 py-4 pb-28">
          {orderQuery.isPending ? (
            <QrisPaymentSkeleton />
          ) : orderQuery.isError ? (
            <ErrorCard message="Detail pembayaran gagal dimuat. Coba muat ulang halaman." />
          ) : null}

          {order && order.paymentMethod !== 'qris' ? (
            <ErrorCard message="Pesanan ini tidak menggunakan pembayaran QRIS." />
          ) : null}

          {order && order.paymentMethod === 'qris' ? (
            <>
              <section className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <Clock aria-hidden="true" className="size-5 text-red-600" />
                <div>
                  <p className="text-sm leading-5 text-slate-800">
                    {isExpired
                      ? 'Waktu pembayaran QRIS sudah berakhir.'
                      : 'Selesaikan pembayaran dalam'}
                  </p>
                  {!isExpired ? (
                    <p className="text-lg leading-7 text-red-600">
                      {formatRemainingTime(remainingMs)}
                    </p>
                  ) : (
                    <p className="text-xs leading-4 text-red-600">
                      Buat pesanan baru atau hubungi UMKM jika pembayaran sudah
                      dilakukan.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                <h2 className="text-sm font-medium leading-5 text-slate-800">
                  Total Pembayaran
                </h2>
                <p className="mt-2 text-3xl leading-9 text-[#1e40af]">
                  {formatRupiah(order.totalPrice)}
                </p>
                <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-3">
                  <div className="overflow-hidden rounded-lg bg-slate-100">
                    {storeQuery.isPending ? (
                      <div className="aspect-square w-full animate-pulse bg-slate-100" />
                    ) : store?.qrisImageUrl ? (
                      <img
                        alt={`QRIS ${store.name}`}
                        className="aspect-square w-full object-contain"
                        src={store.qrisImageUrl}
                      />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center px-6 text-sm leading-5 text-slate-400">
                        QRIS belum tersedia untuk UMKM ini.
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-xs leading-4 text-slate-500">
                  Scan kode QR menggunakan aplikasi mobile banking atau e-wallet
                </p>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-medium leading-5 text-slate-800">
                  Detail Pembayaran
                </h2>
                <div className="mt-3 space-y-2 text-sm leading-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">ID Pesanan</span>
                    <span className="font-mono text-xs text-slate-800">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Metode</span>
                    <span className="text-slate-800">QRIS</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Penerima</span>
                    <span className="text-right text-slate-800">
                      {store?.name ?? '-'}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-medium leading-5 text-slate-800">
                  Upload Bukti Pembayaran
                </h2>
                <p className="mt-2 text-xs leading-4 text-slate-500">
                  Upload screenshot bukti transfer untuk mempercepat verifikasi
                </p>
                <label className="mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center transition hover:border-blue-200 hover:bg-blue-50/40">
                  <Upload
                    aria-hidden="true"
                    className="size-12 text-slate-400"
                  />
                  <span className="mt-3 text-sm font-medium leading-5 text-slate-500">
                    {paymentProofFile
                      ? paymentProofFile.name
                      : 'Klik untuk upload bukti'}
                  </span>
                  <span className="mt-1 text-xs leading-4 text-slate-500">
                    JPG, PNG max 5MB
                  </span>
                  <input
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    onChange={(event) => {
                      handlePaymentProofChange(event.target.files?.[0] ?? null)
                      event.currentTarget.value = ''
                    }}
                    type="file"
                  />
                </label>
                {paymentProofError ? (
                  <p className="mt-2 text-xs leading-4 text-red-600">
                    {paymentProofError}
                  </p>
                ) : null}
              </section>

              <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h2 className="text-sm font-medium leading-5 text-slate-800">
                  Petunjuk Pembayaran:
                </h2>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs leading-4 text-slate-500">
                  <li>Buka aplikasi mobile banking atau e-wallet</li>
                  <li>Pilih menu Scan QR / QRIS</li>
                  <li>Scan kode QR di atas</li>
                  <li>Periksa nominal dan konfirmasi pembayaran</li>
                  <li>Upload bukti pembayaran</li>
                </ol>
              </section>

              {submitError ? <ErrorCard message={submitError} /> : null}
            </>
          ) : null}
        </section>

        {order && order.paymentMethod === 'qris' ? (
          <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-sm border-t border-slate-200 bg-white px-4 py-4 shadow-lg">
            <button
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#1e40af] px-4 text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c] disabled:opacity-60"
              disabled={
                isPending ||
                isExpired ||
                !paymentProofFile ||
                !store?.qrisImageUrl
              }
              onClick={() => {
                void handleSubmit()
              }}
              type="button"
            >
              {isPending ? 'Mengupload Bukti...' : 'Konfirmasi Pembayaran'}
            </button>
            {!paymentProofFile ? (
              <p className="mt-2 text-center text-xs leading-4 text-slate-500">
                Upload bukti pembayaran untuk melanjutkan
              </p>
            ) : isExpired ? (
              <p className="mt-2 text-center text-xs leading-4 text-red-600">
                Waktu pembayaran QRIS sudah berakhir
              </p>
            ) : null}
          </footer>
        ) : null}
      </div>
    </main>
  )
}

function QrisPaymentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
    </div>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
      {message}
    </p>
  )
}

function getRemainingPaymentMs(createdAt: string, now: number) {
  return new Date(createdAt).getTime() + QRIS_PAYMENT_WINDOW_MS - now
}

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return isRecord(value) && typeof value.message === 'string'
}

function isValidationErrorResponse(
  value: unknown,
): value is ValidationErrorResponse {
  return isRecord(value) && Array.isArray(value.errors)
}

function getPaymentErrorMessage(error: unknown, fallback: string) {
  if (isErrorResponse(error)) {
    return error.message
  }

  if (isValidationErrorResponse(error)) {
    const firstIssue = error.errors[0]

    if (firstIssue?.message) {
      return firstIssue.message
    }
  }

  return fallback
}
