import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { EllipsisVertical, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ConfirmationDialog } from '../../../components/common/confirmation-dialog'
import {
  formatProductCategory,
  type ProductCategoryFilter,
} from '../../../components/common/product-category'
import { ProductCategoryTabs } from '../../../components/common/product-category-tabs'
import { ProductSearchForm } from '../../../components/common/product-search-form'
import type { ProductSummaryResponse } from '../../../client'
import { getMyProductsStoresMeProductsGetOptions } from '../../../client/@tanstack/react-query.gen'
import { formatRupiah } from '../dashboard/format'
import { useSellerProductActions } from './use-seller-product-actions'

type SellerProductsPageProps = {
  category: ProductCategoryFilter
  onCategoryChange: (category: ProductCategoryFilter) => void
  onSearchSubmit: (search: string) => void
  search: string
}

export function SellerProductsPage({
  category,
  onCategoryChange,
  onSearchSubmit,
  search,
}: SellerProductsPageProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSummaryResponse | null>(null)
  const productsQuery = useQuery(
    getMyProductsStoresMeProductsGetOptions({
      query: {
        category: category ?? null,
        page: 1,
        pageSize: 20,
        search: search || null,
      },
    }),
  )
  const productActions = useSellerProductActions()
  const products = productsQuery.data?.data ?? []
  const totalProducts = productsQuery.data?.total ?? 0
  const hasActiveFilter = Boolean(search || category)

  return (
    <>
      <header className="bg-[#1e40af] px-4 pb-4 pt-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-medium leading-7">Produk</h1>
            <p className="mt-1 truncate text-sm leading-5 text-white/80">
              Kelola menu toko
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Package aria-hidden="true" className="size-6" />
          </div>
        </div>
        <div className="mt-4">
          <ProductSearchForm
            defaultSearch={search}
            onSubmit={onSearchSubmit}
            placeholder="Cari produk..."
          />
        </div>
      </header>

      <ProductCategoryTabs
        activeCategory={category}
        onChange={onCategoryChange}
      />

      <section className="px-4 pb-24">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium leading-7 text-slate-800">
            Daftar Produk
          </h2>
          <p className="shrink-0 text-sm leading-5 text-slate-500">
            {totalProducts} produk
          </p>
        </div>

        {productActions.errorMessage ? (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm leading-5 text-red-700">
              {productActions.errorMessage}
            </p>
          </div>
        ) : null}

        {productsQuery.isPending ? <SellerProductsSkeleton /> : null}

        {productsQuery.isError ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm leading-5 text-red-700">
              Produk gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        ) : null}

        {productsQuery.isSuccess && products.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center">
            <p className="text-sm leading-5 text-slate-500">
              {hasActiveFilter
                ? 'Tidak ada produk yang sesuai.'
                : 'Belum ada produk.'}
            </p>
          </div>
        ) : null}

        {products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product) => (
              <SellerProductCard
                isAvailabilityPending={
                  productActions.pendingAvailabilityProductId === product.id
                }
                isDeleting={productActions.deletingProductId === product.id}
                key={product.id}
                onDelete={() => setSelectedProduct(product)}
                onToggleAvailability={() => {
                  void productActions.toggleAvailability(product)
                }}
                product={product}
              />
            ))}
          </div>
        ) : null}
      </section>

      <Link
        aria-label="Tambah produk"
        className="fixed bottom-20 left-1/2 z-20 ml-28 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#1e40af] text-white shadow-lg transition hover:bg-[#1d3a9c]"
        title="Tambah produk"
        to="/seller/products/new"
      >
        <Plus aria-hidden="true" className="size-7" strokeWidth={2.4} />
      </Link>

      {selectedProduct ? (
        <ConfirmationDialog
          confirmLabel="Hapus"
          description={`Produk "${selectedProduct.name}" akan dihapus dari toko.`}
          errorMessage={productActions.errorMessage}
          isPending={productActions.deletingProductId === selectedProduct.id}
          onClose={() => setSelectedProduct(null)}
          onConfirm={() => {
            void productActions
              .deleteProduct(selectedProduct)
              .then(() => {
                setSelectedProduct(null)
              })
              .catch(() => undefined)
          }}
          title="Hapus produk?"
          variant="destructive"
        />
      ) : null}
    </>
  )
}

type SellerProductCardProps = {
  isAvailabilityPending: boolean
  isDeleting: boolean
  onDelete: () => void
  onToggleAvailability: () => void
  product: ProductSummaryResponse
}

function SellerProductCard({
  isAvailabilityPending,
  isDeleting,
  onDelete,
  onToggleAvailability,
  product,
}: SellerProductCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-center text-xs leading-4 text-slate-400">
          {product.photoUrl ? (
            <img
              alt={product.name}
              className="size-full object-cover"
              src={product.photoUrl}
            />
          ) : (
            <span className="px-2">Tidak ada foto</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium leading-5 text-slate-800">
                {product.name}
              </h3>
              <p className="mt-1 text-sm leading-5 text-[#1e40af]">
                {formatRupiah(product.price)}
              </p>
            </div>
            <div className="relative shrink-0">
              <button
                aria-expanded={isMenuOpen}
                aria-label={`Aksi ${product.name}`}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setIsMenuOpen((value) => !value)}
                type="button"
              >
                <EllipsisVertical aria-hidden="true" className="size-5" />
              </button>
              {isMenuOpen ? (
                <div className="absolute right-0 top-10 z-10 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <Link
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm leading-5 text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                    params={{
                      productId: product.id,
                    }}
                    to="/seller/products/$productId/edit"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    Edit
                  </Link>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm leading-5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDeleting || isAvailabilityPending}
                    onClick={() => {
                      setIsMenuOpen(false)
                      onDelete()
                    }}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Hapus
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs leading-4 text-slate-500">
                {formatProductCategory(product.category)}
              </p>
              <p
                className={[
                  'mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium leading-4',
                  product.isAvailable
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500',
                ].join(' ')}
              >
                {product.isAvailable ? 'Tersedia' : 'Tidak tersedia'}
              </p>
            </div>
            <button
              aria-checked={product.isAvailable}
              aria-label={`Ubah ketersediaan ${product.name}`}
              className={[
                'relative h-8 w-14 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60',
                product.isAvailable ? 'bg-emerald-500' : 'bg-slate-200',
              ].join(' ')}
              disabled={isAvailabilityPending || isDeleting}
              onClick={onToggleAvailability}
              role="switch"
              type="button"
            >
              <span
                className={[
                  'absolute top-1 size-6 rounded-full bg-white shadow-sm transition',
                  product.isAvailable ? 'left-7' : 'left-1',
                ].join(' ')}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function SellerProductsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          key={index}
        >
          <div className="flex gap-3">
            <div className="size-20 shrink-0 animate-pulse rounded-md bg-slate-100" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="size-9 animate-pulse rounded-lg bg-slate-100" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="h-8 w-14 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
