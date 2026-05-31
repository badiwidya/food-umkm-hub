import { ProductBrowsePage } from '../browse/product-browse-page'
import type { ProductCategoryFilter } from '../browse/product-category'

type StudentHomePageProps = {
  category: ProductCategoryFilter
  onCategoryChange: (category: ProductCategoryFilter) => void
  onSearchSubmit: (search: string) => void
  search: string
}

export function StudentHomePage(props: StudentHomePageProps) {
  const { category, onCategoryChange, onSearchSubmit, search } = props

  return (
    <ProductBrowsePage
      category={category}
      onCategoryChange={onCategoryChange}
      onSearchSubmit={onSearchSubmit}
      search={search}
    />
  )
}
