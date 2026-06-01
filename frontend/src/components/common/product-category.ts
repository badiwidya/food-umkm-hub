import type { ProductCategory } from '../../client'

export type ProductCategoryFilter = ProductCategory | undefined

export const PRODUCT_CATEGORY_OPTIONS = [
  {
    label: 'Semua',
    value: undefined,
  },
  {
    label: 'Makanan',
    value: 'food',
  },
  {
    label: 'Minuman',
    value: 'drink',
  },
] satisfies Array<{
  label: string
  value: ProductCategoryFilter
}>

export function parseProductCategory(value: unknown): ProductCategoryFilter {
  switch (value) {
    case 'food':
    case 'drink':
    case 'snack':
    case 'other':
      return value
    default:
      return undefined
  }
}

export function formatProductCategory(category: ProductCategory) {
  switch (category) {
    case 'food':
      return 'Makanan'
    case 'drink':
      return 'Minuman'
    case 'snack':
      return 'Camilan'
    case 'other':
      return 'Lainnya'
  }
}
