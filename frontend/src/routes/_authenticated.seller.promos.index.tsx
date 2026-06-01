import { createFileRoute } from '@tanstack/react-router'

import { SellerPromosPage } from '../features/seller'

type SellerPromosSearch = {
  page?: number
}

export const Route = createFileRoute('/_authenticated/seller/promos/')({
  validateSearch: (search): SellerPromosSearch => ({
    page: parsePage(search.page),
  }),
  component: SellerPromosRoute,
})

function SellerPromosRoute() {
  const { page = 1 } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <SellerPromosPage
      onPageChange={(nextPage) => {
        void navigate({
          resetScroll: false,
          search: {
            page: nextPage,
          },
        })
      }}
      page={page}
    />
  )
}

function parsePage(value: unknown) {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value === 1 ? undefined : value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)

    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue === 1 ? undefined : parsedValue
    }
  }

  return undefined
}
