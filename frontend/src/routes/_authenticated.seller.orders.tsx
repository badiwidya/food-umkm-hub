import { createFileRoute } from '@tanstack/react-router'

import type { OrderStatus } from '../client'
import { SellerOrdersPage } from '../features/seller'
import { titleHead } from '../lib/page-title'

type SellerOrdersTab = 'berjalan' | 'riwayat'

type SellerOrdersSearch = {
  page: number
  status?: SellerOrderHistoryStatus
  tab: SellerOrdersTab
}

type SellerOrderHistoryStatus = Extract<
  OrderStatus,
  'completed' | 'failed' | 'rejected'
>

export const Route = createFileRoute('/_authenticated/seller/orders')({
  validateSearch: (search): SellerOrdersSearch => ({
    page: parsePage(search.page),
    status: parseHistoryStatus(search.status),
    tab: search.tab === 'riwayat' ? 'riwayat' : 'berjalan',
  }),
  head: () => titleHead('Pesanan Penjual'),
  component: SellerOrdersRoute,
})

function SellerOrdersRoute() {
  const { page, status, tab } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <SellerOrdersPage
      onHistoryPageChange={(nextPage) => {
        void navigate({
          resetScroll: false,
          search: {
            page: nextPage,
            status,
            tab: 'riwayat',
          },
        })
      }}
      onHistoryStatusChange={(nextStatus) => {
        void navigate({
          resetScroll: false,
          search: {
            page: 1,
            status: nextStatus,
            tab: 'riwayat',
          },
        })
      }}
      onTabChange={(nextTab) => {
        void navigate({
          resetScroll: false,
          search: {
            page: 1,
            status: nextTab === 'riwayat' ? status : undefined,
            tab: nextTab,
          },
        })
      }}
      page={page}
      status={status}
      tab={tab}
    />
  )
}

function parsePage(value: unknown) {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)

    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue
    }
  }

  return 1
}

function parseHistoryStatus(
  value: unknown,
): SellerOrderHistoryStatus | undefined {
  if (value === 'completed' || value === 'failed' || value === 'rejected') {
    return value
  }

  return undefined
}
