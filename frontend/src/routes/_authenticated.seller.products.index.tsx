import { createFileRoute } from '@tanstack/react-router'

import {
  parseProductCategory,
  type ProductCategoryFilter,
} from '../components/common/product-category'
import { SellerProductsPage } from '../features/seller'

type SellerProductsSearch = {
  category?: ProductCategoryFilter
  search?: string
}

export const Route = createFileRoute('/_authenticated/seller/products/')({
  validateSearch: (search): SellerProductsSearch => {
    const parsedSearch =
      typeof search.search === 'string' ? search.search.trim() : ''

    return {
      category: parseProductCategory(search.category),
      search: parsedSearch || undefined,
    }
  },
  component: SellerProductsRoute,
})

function SellerProductsRoute() {
  const { category, search } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <SellerProductsPage
      category={category}
      onCategoryChange={(nextCategory) => {
        void navigate({
          resetScroll: false,
          search: {
            category: nextCategory,
            search: search || undefined,
          },
        })
      }}
      onSearchSubmit={(nextSearch) => {
        void navigate({
          resetScroll: false,
          search: {
            category,
            search: nextSearch || undefined,
          },
        })
      }}
      search={search ?? ''}
    />
  )
}
