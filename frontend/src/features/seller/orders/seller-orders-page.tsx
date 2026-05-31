import { useQuery } from '@tanstack/react-query'
import { ReceiptText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { EmptyState } from '../components/empty-state'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import { getSellerOrders } from '../services/seller-service'
import type { SellerOrder, SellerOrderStatus } from '../types'
import { PaymentProofModal } from './payment-proof-modal'
import { SellerOrderCard } from './seller-order-card'

const tabs: {
  label: string
  value: 'all' | SellerOrderStatus
}[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Pending Pembayaran', value: 'pending_payment' },
  { label: 'Menunggu Verifikasi', value: 'waiting_verification' },
  { label: 'Diproses', value: 'processing' },
  { label: 'Siap Diambil', value: 'ready' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Ditolak', value: 'rejected' },
]

export function SellerOrdersPage() {
  const ordersQuery = useQuery({
    queryFn: getSellerOrders,
    queryKey: ['seller-orders'],
  })

  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]['value']>('all')
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null)

  useEffect(() => {
    if (ordersQuery.data) {
      setOrders(ordersQuery.data)
    }
  }, [ordersQuery.data])

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders
    return orders.filter((order) => order.status === activeTab)
  }, [activeTab, orders])

  function updateStatus(orderId: string, status: SellerOrderStatus) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    )
  }

  function confirmPayment(orderId: string) {
    updateStatus(orderId, 'processing')
    setSelectedOrder(null)
  }

  function rejectPayment(orderId: string, reason: string) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? { ...order, rejectionReason: reason, status: 'rejected' }
          : order,
      ),
    )
    setSelectedOrder(null)
  }

  return (
    <>
      <PageHeader
        description="Kelola pesanan masuk, verifikasi pembayaran, dan update status pesanan."
        title="Kelola Pesanan"
      />

      <div className="mb-5 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                activeTab === tab.value
                  ? 'bg-[#006B3F] text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              ].join(' ')}
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {ordersQuery.isPending ? <LoadingState /> : null}

      {ordersQuery.isError ? (
        <EmptyState
          description="Terjadi kesalahan saat memuat pesanan. Coba muat ulang halaman."
          icon={<ReceiptText className="size-6" />}
          title="Pesanan gagal dimuat"
        />
      ) : null}

      {ordersQuery.isSuccess && filteredOrders.length === 0 ? (
        <EmptyState
          description="Belum ada pesanan pada kategori ini."
          icon={<ReceiptText className="size-6" />}
          title="Pesanan kosong"
        />
      ) : null}

      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <SellerOrderCard
            key={order.id}
            onOpenPaymentProof={setSelectedOrder}
            onUpdateStatus={updateStatus}
            order={order}
          />
        ))}
      </div>

      <PaymentProofModal
        onClose={() => setSelectedOrder(null)}
        onConfirm={confirmPayment}
        onReject={rejectPayment}
        order={selectedOrder}
      />
    </>
  )
}