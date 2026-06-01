import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Clock,
  MapPin,
  Minus,
  Plus,
  ReceiptText,
  ShoppingCart,
  Star,
} from 'lucide-react'
import { useState } from 'react'

import type { ReviewResponse } from '../../../client'
import type { CartItem, CartStoreInfo } from '../../../stores/cart-store'
import {
  getProductDetailsProductsIdGetOptions,
  getProductReviewsProductsIdReviewsGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import { usePageTitle } from '../../../lib/page-title'
import { useCartStore } from '../../../stores/cart-store'
import { formatRating, formatRupiah } from '../browse/format'
import { ProductFavoriteButton } from '../browse/product-favorite-button'

type ProductDetailPageProps = {
  productId: string
  source: 'catalog' | 'store'
  storeId?: string
}

export function ProductDetailPage({
  productId,
  source,
  storeId,
}: ProductDetailPageProps) {
  const navigate = useNavigate()
  const productQuery = useQuery(
    getProductDetailsProductsIdGetOptions({
      path: {
        id: productId,
      },
    }),
  )
  const addItem = useCartStore((state) => state.addItem)
  const replaceCart = useCartStore((state) => state.replaceCart)
  const cartStoreId = useCartStore((state) => state.storeId)
  const cartStoreName = useCartStore((state) => state.storeName)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [isAdded, setIsAdded] = useState(false)
  const [pendingCartItem, setPendingCartItem] = useState<{
    item: CartItem
    store: CartStoreInfo
  } | null>(null)
  const product = productQuery.data
  const totalPrice = (product?.price ?? 0) * quantity
  const isStoreScoped = source === 'store'

  usePageTitle(product?.name, 'Detail Produk')

  function handleAddToCart() {
    if (!product) {
      return
    }

    const item = {
      note: note.trim(),
      photoUrl: product.photoUrl,
      price: product.price,
      productId: product.id,
      productName: product.name,
      quantity,
    } satisfies CartItem
    const store = {
      storeId: product.store.id,
      storeName: product.store.name,
    } satisfies CartStoreInfo

    if (cartStoreId && cartStoreId !== product.store.id) {
      setPendingCartItem({ item, store })
      return
    }

    addItem(item, store)
    setIsAdded(true)
  }

  function handleReplaceCart() {
    if (!pendingCartItem) {
      return
    }

    replaceCart(pendingCartItem.item, pendingCartItem.store)
    setPendingCartItem(null)
    setIsAdded(true)
  }

  function handleOrderNow() {
    if (!product) {
      return
    }

    void navigate({
      search: {
        note: note.trim() || undefined,
        productId: product.id,
        quantity,
        returnTo: 'product',
      },
      to: '/checkout',
    })
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-sm bg-white">
        <header className="sticky top-0 z-10 bg-[#1e40af] px-3 py-2 text-white">
          <div className="flex h-10 items-center gap-3">
            <Link
              aria-label="Kembali"
              className="flex size-10 items-center justify-center rounded-full transition hover:bg-white/10"
              params={isStoreScoped && storeId ? { storeId } : undefined}
              to={isStoreScoped && storeId ? '/stores/$storeId' : '/'}
            >
              <ArrowLeft aria-hidden="true" className="size-6" />
            </Link>
            <h1 className="text-xl font-medium leading-7">Detail Produk</h1>
          </div>
        </header>

        {productQuery.isPending ? (
          <ProductDetailSkeleton />
        ) : productQuery.isError ? (
          <div className="px-4 py-8 text-center">
            <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-sm leading-5 text-red-700">
              Produk gagal dimuat. Coba muat ulang halaman.
            </p>
          </div>
        ) : product ? (
          <div>
            <div className="aspect-[10/7] bg-slate-100">
              {product.photoUrl ? (
                <img
                  alt={product.name}
                  className="size-full object-cover"
                  src={product.photoUrl}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm leading-5 text-slate-400">
                  Tidak ada foto
                </div>
              )}
            </div>
            <section className="space-y-5 px-4 py-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 flex-1 text-xl font-medium leading-7 text-slate-800">
                    {product.name}
                  </h2>
                  <ProductFavoriteButton
                    className="flex size-8 shrink-0 items-center justify-center rounded-full transition"
                    productId={product.id}
                  />
                </div>
                <Link
                  className="mt-2 inline-block text-sm leading-5 text-slate-500 transition hover:text-[#1e40af] hover:underline"
                  params={{ storeId: product.store.id }}
                  to="/stores/$storeId"
                >
                  {product.store.name}
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-5 text-slate-500">
                <span className="flex items-center gap-1">
                  <Star
                    aria-hidden="true"
                    className="size-4 text-amber-400"
                    fill="currentColor"
                  />
                  {formatRating(product.rating)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin aria-hidden="true" className="size-4" />
                  Kampus IPB
                </span>
                <span className="flex items-center gap-1">
                  <Clock aria-hidden="true" className="size-4" />
                  15-20 menit
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium leading-5 text-slate-800">
                  Deskripsi
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {product.description || 'Belum ada deskripsi produk.'}
                </p>
              </div>

              <ProductReviewsSection
                productId={product.id}
                rating={product.rating}
                totalReviews={product.totalReviews}
              />

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium leading-5 text-slate-800">
                      Jumlah
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        aria-label="Kurangi jumlah"
                        className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40"
                        disabled={quantity === 1}
                        onClick={() =>
                          setQuantity((currentQuantity) =>
                            Math.max(1, currentQuantity - 1),
                          )
                        }
                        type="button"
                      >
                        <Minus aria-hidden="true" className="size-5" />
                      </button>
                      <span className="w-8 text-center text-lg leading-7 text-slate-800">
                        {quantity}
                      </span>
                      <button
                        aria-label="Tambah jumlah"
                        className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
                        onClick={() =>
                          setQuantity((currentQuantity) => currentQuantity + 1)
                        }
                        type="button"
                      >
                        <Plus aria-hidden="true" className="size-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm leading-5 text-slate-500">
                      Total Harga
                    </p>
                    <p className="text-base leading-6 text-[#1e40af]">
                      {formatRupiah(totalPrice)}
                    </p>
                  </div>
                </div>
              </div>

              <label className="block rounded-lg border border-slate-200 p-4">
                <span className="text-sm font-medium leading-5 text-slate-800">
                  Catatan Pesanan
                </span>
                <textarea
                  className="mt-3 min-h-20 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white"
                  onChange={(event) => {
                    setNote(event.target.value)
                    setIsAdded(false)
                  }}
                  placeholder="Contoh: Tanpa cabe, extra kerupuk"
                  value={note}
                />
              </label>

              {isStoreScoped && isAdded ? (
                <div className="rounded-lg bg-green-50 px-3 py-2 text-sm leading-5 text-green-700">
                  <p>Produk ditambahkan ke keranjang.</p>
                  <button
                    className="mt-1 font-medium text-green-800 underline underline-offset-2"
                    onClick={() => {
                      void navigate({
                        search: {
                          storeId: product.store.id,
                        },
                        to: '/cart',
                      })
                    }}
                    type="button"
                  >
                    Lihat keranjang
                  </button>
                </div>
              ) : null}

              {isStoreScoped ? (
                <button
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1e40af] px-4 text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c] disabled:opacity-50"
                  disabled={!product.isAvailable}
                  onClick={handleAddToCart}
                  type="button"
                >
                  <ShoppingCart aria-hidden="true" className="size-5" />
                  Tambah ke Keranjang
                </button>
              ) : (
                <button
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1e40af] px-4 text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c] disabled:opacity-50"
                  disabled={!product.isAvailable}
                  onClick={handleOrderNow}
                  type="button"
                >
                  <ReceiptText aria-hidden="true" className="size-5" />
                  Pesan Sekarang
                </button>
              )}
            </section>
            {isStoreScoped && pendingCartItem ? (
              <div
                aria-modal="true"
                className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 px-4 pb-4"
                role="dialog"
              >
                <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
                  <h3 className="text-base font-medium leading-6 text-slate-900">
                    Ganti keranjang?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Keranjang Anda berisi produk dari{' '}
                    {cartStoreName ?? 'UMKM lain'}. Produk dari{' '}
                    {product.store.name} akan mengganti isi keranjang.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-medium leading-5 text-slate-700 transition hover:bg-slate-50"
                      onClick={() => setPendingCartItem(null)}
                      type="button"
                    >
                      Batal
                    </button>
                    <button
                      className="h-11 rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c]"
                      onClick={handleReplaceCart}
                      type="button"
                    >
                      Ganti
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  )
}

function ProductReviewsSection({
  productId,
  rating,
  totalReviews,
}: {
  productId: string
  rating: number | null
  totalReviews: number
}) {
  const reviewsQuery = useQuery(
    getProductReviewsProductsIdReviewsGetOptions({
      path: {
        id: productId,
      },
      query: {
        page: 1,
        pageSize: 5,
      },
    }),
  )
  const reviews = reviewsQuery.data?.data ?? []

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium leading-5 text-slate-800">
          Ulasan Produk
        </h3>
        <p className="flex shrink-0 items-center gap-1 text-xs leading-4 text-slate-500">
          <Star
            aria-hidden="true"
            className="size-4 text-amber-400"
            fill="currentColor"
          />
          {rating === null
            ? 'Belum ada rating'
            : `${formatRating(rating)} (${totalReviews} ulasan)`}
        </p>
      </div>

      {reviewsQuery.isPending ? <ProductReviewsSkeleton /> : null}

      {reviewsQuery.isError ? (
        <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-3 text-sm leading-5 text-red-700">
          Ulasan gagal dimuat.
        </p>
      ) : null}

      {reviewsQuery.isSuccess && reviews.length === 0 ? (
        <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm leading-5 text-slate-500">
          Belum ada ulasan
        </p>
      ) : null}

      {reviews.length > 0 ? (
        <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1">
          <div className="flex gap-3">
            {reviews.map((review) => (
              <ProductReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ProductReviewCard({ review }: { review: ReviewResponse }) {
  return (
    <article className="min-h-28 w-56 shrink-0 rounded-lg border border-slate-200 bg-white p-3">
      <RatingStars rating={review.rating} />
      <p className="mt-3 line-clamp-4 text-sm leading-5 text-slate-600">
        {review.comment?.trim() || 'Tanpa komentar.'}
      </p>
    </article>
  )
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const isSelected = index < rating

        return (
          <Star
            aria-hidden="true"
            className={[
              'size-4',
              isSelected ? 'text-amber-400' : 'text-slate-300',
            ]
              .filter(Boolean)
              .join(' ')}
            fill={isSelected ? 'currentColor' : 'none'}
            key={index}
          />
        )
      })}
    </div>
  )
}

function ProductReviewsSkeleton() {
  return (
    <div className="-mx-4 mt-3 overflow-hidden px-4">
      <div className="flex gap-3">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            className="h-28 w-56 shrink-0 animate-pulse rounded-lg bg-slate-100"
            key={index}
          />
        ))}
      </div>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div>
      <div className="aspect-[10/7] animate-pulse bg-slate-100" />
      <div className="space-y-5 px-4 py-5">
        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-20 animate-pulse rounded bg-slate-100" />
        <div className="h-28 animate-pulse rounded bg-slate-100" />
        <div className="h-36 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  )
}
