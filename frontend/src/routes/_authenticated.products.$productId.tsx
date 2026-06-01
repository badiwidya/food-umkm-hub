import { createFileRoute } from '@tanstack/react-router'

import { ProductDetailPage } from '../features/student/product-detail/product-detail-page'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute('/_authenticated/products/$productId')({
  head: () => titleHead('Detail Produk'),
  component: ProductDetailRoute,
})

function ProductDetailRoute() {
  const { productId } = Route.useParams()

  return <ProductDetailPage productId={productId} source="catalog" />
}
