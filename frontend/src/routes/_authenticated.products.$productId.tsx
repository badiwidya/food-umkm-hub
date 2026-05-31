import { createFileRoute } from '@tanstack/react-router'

import { ProductDetailPage } from '../features/student/product-detail/product-detail-page'

export const Route = createFileRoute('/_authenticated/products/$productId')({
  component: ProductDetailRoute,
})

function ProductDetailRoute() {
  const { productId } = Route.useParams()

  return <ProductDetailPage productId={productId} source="catalog" />
}
