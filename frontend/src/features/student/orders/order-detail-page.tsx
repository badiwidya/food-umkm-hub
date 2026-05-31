import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Check } from 'lucide-react'

import type { OrderStatus, PaymentMethod } from '../../../client'
import { getOrderDetailsOrdersIdGetOptions } from '../../../client/@tanstack/react-query.gen'
import { formatRupiah } from '../browse/format'
import { getOrderStatusLabel } from './order-status'

type OrderDetailPageProps = {
  orderId: string
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const orderQuery = useQuery(
    getOrderDetailsOrdersIdGetOptions({
      path: {
        id: orderId,
      },
    }),
  )
  const order = orderQuery.data

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-sm bg-white">
        <header className="sticky top-0 z-10 bg-[#1e40af] px-3 py-2 text-white">
          <div className="flex h-10 items-center gap-3">
            <Link
              aria-label="Kembali"
              className="flex size-10 items-center justify-center rounded-full transition hover:bg-white/10"
              search={{
                status: undefined,
              }}
              to="/activity"
            >
              <ArrowLeft aria-hidden="true" className="size-6" />
            </Link>
            <h1 className="text-xl font-medium leading-7">Detail Pesanan</h1>
          </div>
        </header>

        <section className="space-y-4 px-4 py-4">
          {orderQuery.isPending ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-56 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ) : null}

          {orderQuery.isError ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
              <p className="text-sm leading-5 text-red-700">
                Detail pesanan gagal dimuat. Coba muat ulang halaman.
              </p>
            </div>
          ) : null}

          {order ? (
            <>
              <section className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-medium leading-5 text-slate-800">
                  {getOrderStatusLabel(order.status)}
                </p>
                <p className="mt-1 text-xs leading-4 text-slate-500">
                  Pesanan sedang diproses sesuai status terbaru.
                </p>
                {canResumeQrisPayment(order) ? (
                  <Link
                    className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c]"
                    params={{ orderId: order.id }}
                    to="/orders/$orderId/payment"
                  >
                    Lakukan Pembayaran
                  </Link>
                ) : null}
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-medium leading-5 text-slate-800">
                  Status Pesanan
                </h2>
                <div className="mt-4 space-y-1">
                  {ORDER_STATUS_STEPS.map((step, index) => {
                    const isActive =
                      getOrderStatusStepIndex(order.status) >= index

                    return (
                      <div className="flex gap-3" key={step.status}>
                        <div className="flex flex-col items-center">
                          <span
                            className={[
                              'flex size-7 items-center justify-center rounded-full border text-xs leading-4',
                              isActive
                                ? 'border-[#1e40af] bg-[#1e40af] text-white'
                                : 'border-slate-200 bg-slate-100 text-slate-400',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {isActive ? (
                              <Check aria-hidden="true" className="size-4" />
                            ) : (
                              index + 1
                            )}
                          </span>
                          {index < ORDER_STATUS_STEPS.length - 1 ? (
                            <span
                              className={[
                                'h-8 w-0.5',
                                isActive ? 'bg-[#1e40af]' : 'bg-slate-200',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 pt-1">
                          <p
                            className={[
                              'text-sm leading-5',
                              isActive ? 'text-slate-800' : 'text-slate-400',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs leading-4 text-slate-400">
                            {isActive ? 'Selesai' : '-'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-medium leading-5 text-slate-800">
                  Detail Pesanan
                </h2>
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
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="text-xs leading-4 text-slate-500">Catatan:</p>
                  <p className="mt-1 text-sm leading-5 text-slate-800">
                    {order.notes || '-'}
                  </p>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-medium leading-5 text-slate-800">
                  Ringkasan Pembayaran
                </h2>
                <div className="mt-3 space-y-2 text-sm leading-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">ID Pesanan</span>
                    <span className="font-mono text-xs text-slate-800">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Metode Pembayaran</span>
                    <span className="text-slate-800">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </span>
                  </div>
                  {order.paymentProofUrl ? (
                    <div className="space-y-2 border-t border-slate-200 pt-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500">Bukti Pembayaran</span>
                        <a
                          className="text-xs text-[#1e40af] underline underline-offset-2"
                          href={order.paymentProofUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Buka gambar
                        </a>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        <img
                          alt="Bukti pembayaran"
                          className="max-h-96 w-full object-contain"
                          src={order.paymentProofUrl}
                        />
                      </div>
                    </div>
                  ) : null}
                  {order.discountAmount > 0 ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-red-600">Diskon</span>
                      <span className="text-red-600">
                        - {formatRupiah(order.discountAmount)}
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
              </section>
            </>
          ) : null}
        </section>
      </div>
    </main>
  )
}

const ORDER_STATUS_STEPS = [
  {
    label: 'Pesanan Dibuat',
    status: 'pending',
  },
  {
    label: 'Menunggu Konfirmasi',
    status: 'waiting_for_confirmation',
  },
  {
    label: 'Sedang Diproses',
    status: 'in_process',
  },
  {
    label: 'Siap Diambil',
    status: 'ready_to_pickup',
  },
  {
    label: 'Selesai',
    status: 'completed',
  },
] satisfies Array<{
  label: string
  status: OrderStatus
}>

function getOrderStatusStepIndex(status: OrderStatus) {
  if (status === 'rejected' || status === 'failed') {
    return 0
  }

  return ORDER_STATUS_STEPS.findIndex((step) => step.status === status)
}

function getPaymentMethodLabel(paymentMethod: PaymentMethod) {
  switch (paymentMethod) {
    case 'cash':
      return 'Bayar di Tempat'
    case 'qris':
      return 'QRIS'
  }
}

function canResumeQrisPayment(order: {
  paymentMethod: PaymentMethod
  paymentProofUrl: string | null
  status: OrderStatus
}) {
  return (
    order.paymentMethod === 'qris' &&
    order.status === 'pending' &&
    order.paymentProofUrl === null
  )
}
