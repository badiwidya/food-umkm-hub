import { createFileRoute } from '@tanstack/react-router'

import {
  parseProductCategory,
  type ProductCategoryFilter,
} from '../features/student/browse/product-category'
import { StoreDetailPage } from '../features/student/store-detail/store-detail-page'
import { titleHead } from '../lib/page-title'

type StoreDetailSearch = {
  category?: ProductCategoryFilter
}

export const Route = createFileRoute('/_authenticated/stores/$storeId')({
  validateSearch: (search): StoreDetailSearch => ({
    category: parseProductCategory(search.category),
  }),
  head: () => titleHead('Detail UMKM'),
  component: StoreDetailRoute,
})

function StoreDetailRoute() {
  const { storeId } = Route.useParams()
  const { category } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <StoreDetailPage
      category={category}
      onCategoryChange={(nextCategory) => {
        void navigate({
          resetScroll: false,
          search: {
            category: nextCategory,
          },
        })
      }}
      storeId={storeId}
    />
  )
}
