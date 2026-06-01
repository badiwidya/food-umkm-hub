import { ProductSearchForm as CommonProductSearchForm } from '../../../components/common/product-search-form'

type ProductSearchFormProps = {
  defaultSearch: string
  onSubmit: (search: string) => void
}

export function ProductSearchForm(props: ProductSearchFormProps) {
  return (
    <CommonProductSearchForm
      {...props}
      placeholder="Cari makanan atau UMKM..."
    />
  )
}
