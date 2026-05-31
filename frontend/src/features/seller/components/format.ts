export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatPaymentMethod(value: string) {
  const labels: Record<string, string> = {
    cod: 'Bayar di Tempat',
    qris: 'QRIS',
    transfer: 'Transfer',
  }

  return labels[value] ?? value
}