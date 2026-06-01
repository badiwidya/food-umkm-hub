import { createFileRoute } from '@tanstack/react-router'

import { ProductDetailPage } from '../features/student/product-detail/product-detail-page'
import { titleHead } from '../lib/page-title'

export const Route = createFileRoute(
  '/_authenticated/stores/$storeId_/products/$productId',
)({
  head: () => titleHead('Detail Produk'),
  component: StoreProductDetailRoute,
})

function StoreProductDetailRoute() {
  const { productId, storeId } = Route.useParams()

  return (
    <ProductDetailPage productId={productId} source="store" storeId={storeId} />
  )
}
