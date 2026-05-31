export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  })
    .format(value)
    .replace(/\s/g, ' ')
}

export function formatRating(value: number | null) {
  return value?.toFixed(1) ?? '-'
}
