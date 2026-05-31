import { useQuery } from '@tanstack/react-query'
import { Package, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '../components/empty-state'
import { LoadingState } from '../components/loading-state'
import { PageHeader } from '../components/page-header'
import { getSellerProducts } from '../services/seller-service'
import type { SellerProduct } from '../types'
import { ProductCard } from './product-card'
import { ProductForm } from './product-form'

export function SellerProductsPage() {
  const productsQuery = useQuery({
    queryFn: getSellerProducts,
    queryKey: ['seller-products'],
  })

  const [products, setProducts] = useState<SellerProduct[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(
    null,
  )

  useEffect(() => {
    if (productsQuery.data) {
      setProducts(productsQuery.data)
    }
  }, [productsQuery.data])

  function saveProduct(product: SellerProduct) {
    setProducts((currentProducts) => {
      const exists = currentProducts.some((item) => item.id === product.id)

      if (exists) {
        return currentProducts.map((item) =>
          item.id === product.id ? product : item,
        )
      }

      return [product, ...currentProducts]
    })

    setFormOpen(false)
    setEditingProduct(null)
  }

  function toggleAvailable(productId: string) {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? { ...product, isAvailable: !product.isAvailable }
          : product,
      ),
    )
  }

  function toggleActive(productId: string) {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? { ...product, isActive: !product.isActive }
          : product,
      ),
    )
  }

  return (
    <>
      <PageHeader
        description="Tambah, edit, dan kelola status produk UMKM."
        title="Kelola Produk"
        action={
          <button
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#006B3F] px-4 text-sm font-medium text-white hover:bg-[#004D2E]"
            onClick={() => {
              setEditingProduct(null)
              setFormOpen(true)
            }}
            type="button"
          >
            <Plus className="size-4" />
            Tambah Produk
          </button>
        }
      />

      {formOpen ? (
        <div className="mb-5">
          <ProductForm
            initialValue={editingProduct}
            onCancel={() => {
              setFormOpen(false)
              setEditingProduct(null)
            }}
            onSubmit={saveProduct}
          />
        </div>
      ) : null}

      {productsQuery.isPending ? <LoadingState /> : null}

      {productsQuery.isSuccess && products.length === 0 ? (
        <EmptyState
          description="Tambahkan produk pertama agar pembeli bisa mulai memesan."
          icon={<Package className="size-6" />}
          title="Belum ada produk"
        />
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            onEdit={(selectedProduct) => {
              setEditingProduct(selectedProduct)
              setFormOpen(true)
            }}
            onToggleActive={toggleActive}
            onToggleAvailable={toggleAvailable}
            product={product}
          />
        ))}
      </div>
    </>
  )
}