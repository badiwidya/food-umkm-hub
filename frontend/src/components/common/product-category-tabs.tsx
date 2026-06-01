import {
  PRODUCT_CATEGORY_OPTIONS,
  type ProductCategoryFilter,
} from './product-category'

type ProductCategoryTabsProps = {
  activeCategory: ProductCategoryFilter
  onChange: (category: ProductCategoryFilter) => void
}

export function ProductCategoryTabs({
  activeCategory,
  onChange,
}: ProductCategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-4">
      {PRODUCT_CATEGORY_OPTIONS.map((option) => {
        const isActive = activeCategory === option.value

        return (
          <button
            className={[
              'h-10 shrink-0 rounded-full px-4 text-base font-medium leading-6 transition',
              isActive
                ? 'bg-[#1e40af] text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
            ]
              .filter(Boolean)
              .join(' ')}
            key={option.label}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
