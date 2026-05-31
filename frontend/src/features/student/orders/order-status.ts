import type { OrderStatus } from '../../../client'

export function getOrderStatusLabel(status: OrderStatus) {
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
