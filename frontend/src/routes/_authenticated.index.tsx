import { createFileRoute } from '@tanstack/react-router'

import { StudentHomePage } from '../features/student'
import {
  parseProductCategory,
  type ProductCategoryFilter,
} from '../features/student/browse/product-category'

type StudentHomeSearch = {
  category?: ProductCategoryFilter
  search?: string
}

export const Route = createFileRoute('/_authenticated/')({
  validateSearch: (search): StudentHomeSearch => {
    const parsedSearch =
      typeof search.search === 'string' ? search.search.trim() : ''
    const category = parseProductCategory(search.category)

    return {
      category,
      search: parsedSearch || undefined,
    }
  },
  component: StudentHomeRoute,
})

function StudentHomeRoute() {
  const { category, search } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <StudentHomePage
      category={category}
      onCategoryChange={(nextCategory) => {
        void navigate({
          search: {
            category: nextCategory,
            search: search || undefined,
          },
        })
      }}
      onSearchSubmit={(nextSearch) => {
        void navigate({
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
