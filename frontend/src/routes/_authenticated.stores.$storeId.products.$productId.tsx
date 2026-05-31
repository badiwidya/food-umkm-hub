import { createFileRoute } from '@tanstack/react-router'

import { ProductDetailPage } from '../features/student/product-detail/product-detail-page'

export const Route = createFileRoute(
  '/_authenticated/stores/$storeId/products/$productId',
)({
  component: StoreProductDetailRoute,
})

function StoreProductDetailRoute() {
  const { productId, storeId } = Route.useParams()

  return (
    <ProductDetailPage productId={productId} source="store" storeId={storeId} />
  )
}
