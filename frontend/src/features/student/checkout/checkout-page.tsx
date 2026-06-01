import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Clock, MapPin } from 'lucide-react'

import type { PaymentMethod } from '../../../client'
import {
  getDetailStoresIdGetOptions,
  getProductDetailsProductsIdGetOptions,
} from '../../../client/@tanstack/react-query.gen'
import type { CartItem } from '../../../stores/cart-store'
import { useCartStore } from '../../../stores/cart-store'
import { getCartSubtotal } from '../cart/cart-selectors'
import { formatRupiah } from '../browse/format'
import { CheckoutSummary } from './checkout-summary'
import { PromoCodeField } from './promo-code-field'
import { useCheckoutForm } from './use-checkout-form'

export type CheckoutSearch = {
  note?: string
  productId?: string
  quantity?: number
  returnTo?: 'cart' | 'product'
}

type CheckoutBackTarget =
  | {
      params: {
        productId: string
      }
      to: '/products/$productId'
    }
  | {
      to: '/cart'
    }
  | {
      to: '/'
    }

type CheckoutPageProps = {
  search: CheckoutSearch
}

export function CheckoutPage({ search }: CheckoutPageProps) {
  if (search.productId) {
    return <DirectCheckoutPage search={search} />
  }

  return <CartCheckoutPage />
}

function CartCheckoutPage() {
  const items = useCartStore((state) => state.items)
  const storeId = useCartStore((state) => state.storeId)
  const storeName = useCartStore((state) => state.storeName)

  return (
    <CheckoutContent
      backTarget={{ to: '/cart' }}
      clearCartOnSuccess
      emptyDescription="Tambahkan produk sebelum membuat pesanan."
      emptyTitle="Keranjang kosong"
      items={items}
      storeId={storeId}
      storeName={storeName}
    />
  )
}

function DirectCheckoutPage({ search }: { search: CheckoutSearch }) {
  const productQuery = useQuery(
    getProductDetailsProductsIdGetOptions({
      path: {
        id: search.productId ?? '',
      },
    }),
  )
  const product = productQuery.data
  const quantity = search.quantity ?? 1
  const items =
    product === undefined
      ? []
      : [
          {
            note: search.note ?? '',
            photoUrl: product.photoUrl,
            price: product.price,
            productId: product.id,
            productName: product.name,
            quantity,
          } satisfies CartItem,
        ]

  const backTarget = getDirectCheckoutBackTarget(search)

  if (productQuery.isPending) {
    return <CheckoutLoadingPage backTarget={backTarget} />
  }

  if (productQuery.isError || !product) {
    return (
      <CheckoutEmptyPage
        backTarget={backTarget}
        description="Produk gagal dimuat. Coba kembali ke katalog."
        title="Checkout tidak tersedia"
      />
    )
  }

  return (
    <CheckoutContent
      backTarget={backTarget}
      clearCartOnSuccess={false}
      defaultNotes={search.note}
      emptyDescription="Produk tidak ditemukan untuk checkout langsung."
      emptyTitle="Checkout tidak tersedia"
      items={items}
      storeId={product.store.id}
      storeName={product.store.name}
    />
  )
}

function CheckoutContent({
  backTarget,
  clearCartOnSuccess,
  defaultNotes,
  emptyDescription,
  emptyTitle,
  items,
  storeId,
  storeName,
}: {
  backTarget: CheckoutBackTarget
  clearCartOnSuccess: boolean
  defaultNotes?: string
  emptyDescription: string
  emptyTitle: string
  items: Array<CartItem>
  storeId: string | null
  storeName: string | null
}) {
  const subtotal = getCartSubtotal(items)
  const storeQuery = useQuery({
    ...getDetailStoresIdGetOptions({
      path: {
        id: storeId ?? '',
      },
    }),
    enabled: storeId !== null,
  })
  const qrisImageUrl = storeQuery.data?.qrisImageUrl ?? null
  const checkoutStoreName = storeQuery.data?.name ?? storeName
  const checkout = useCheckoutForm({
    clearCartOnSuccess,
    defaultNotes,
    items,
    qrisImageUrl,
    storeId,
  })
  const total =
    checkout.appliedPromo && !checkout.isPromoStale
      ? checkout.appliedPromo.finalAmount
      : subtotal

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col bg-white">
        <header className="sticky top-0 z-10 bg-[#1e40af] px-3 py-2 text-white">
          <div className="flex h-10 items-center gap-3">
            <CheckoutBackIconLink target={backTarget} />
            <h1 className="text-xl font-medium leading-7">Checkout</h1>
          </div>
        </header>

        {items.length === 0 ? (
          <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
            <h2 className="text-lg font-medium leading-7 text-slate-800">
              {emptyTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {emptyDescription}
            </p>
            <Link
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c]"
              to="/"
            >
              Cari Produk
            </Link>
          </section>
        ) : (
          <form className="flex flex-1 flex-col" onSubmit={checkout.onSubmit}>
            <div className="flex-1 space-y-4 px-4 py-4 pb-28">
              <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e40af]">
                    <MapPin aria-hidden="true" className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-medium leading-5 text-slate-800">
                      Lokasi Pengambilan
                    </h2>
                    <p className="mt-1 text-xs leading-4 text-slate-500">
                      {checkoutStoreName ?? 'UMKM'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e40af]">
                    <Clock aria-hidden="true" className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-medium leading-5 text-slate-800">
                      Estimasi Waktu
                    </h2>
                    <p className="mt-1 text-xs leading-4 text-slate-500">
                      15-20 menit setelah pesanan dikonfirmasi
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-medium leading-5 text-slate-800">
                  Pesanan Anda
                </h2>
                <div className="mt-3 space-y-2">
                  {items.map((item) => (
                    <div
                      className="flex items-start justify-between gap-3 text-sm leading-5"
                      key={`${item.productId}:${item.note.trim()}`}
                    >
                      <span className="min-w-0 flex-1 text-slate-500">
                        {item.productName} x{item.quantity}
                      </span>
                      <span className="shrink-0 text-slate-800">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <PromoCodeField
                appliedPromo={checkout.appliedPromo}
                errorMessage={checkout.promoError}
                form={checkout.form}
                isPending={checkout.isPromoPending}
                isStale={checkout.isPromoStale}
                onApply={() => {
                  void checkout.handleApplyPromo()
                }}
                onRemove={checkout.handleRemovePromo}
              />

              <label className="block rounded-lg border border-slate-200 bg-white p-4">
                <span className="text-sm font-medium leading-5 text-slate-800">
                  Catatan Pesanan
                </span>
                <textarea
                  className="mt-3 min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white"
                  placeholder="Contoh: Tanpa cabe, extra kerupuk"
                  {...checkout.form.register('notes')}
                />
                {checkout.form.formState.errors.notes?.message ? (
                  <p className="mt-2 text-xs leading-4 text-red-600">
                    {checkout.form.formState.errors.notes.message}
                  </p>
                ) : null}
              </label>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-medium leading-5 text-slate-800">
                  Metode Pembayaran
                </h2>
                <div className="mt-3 space-y-2">
                  <PaymentMethodOption
                    description={
                      qrisImageUrl
                        ? 'Bayar dengan scan QR'
                        : 'QRIS belum tersedia untuk UMKM ini'
                    }
                    disabled={!qrisImageUrl}
                    isSelected={checkout.paymentMethod === 'qris'}
                    label="QRIS"
                    method="qris"
                    onSelect={checkout.handlePaymentMethodChange}
                  />
                  <PaymentMethodOption
                    description="Bayar saat mengambil pesanan"
                    isSelected={checkout.paymentMethod === 'cash'}
                    label="Bayar di Tempat"
                    method="cash"
                    onSelect={checkout.handlePaymentMethodChange}
                  />
                </div>
              </section>

              <CheckoutSummary
                appliedPromo={checkout.appliedPromo}
                isPromoStale={checkout.isPromoStale}
                items={items}
                subtotal={subtotal}
              />

              {checkout.submitError ? (
                <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {checkout.submitError}
                </p>
              ) : null}
            </div>

            <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-sm border-t border-slate-200 bg-white px-4 py-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-sm leading-5 text-slate-500">Total</span>
                <span className="text-xl leading-7 text-[#1e40af]">
                  {formatRupiah(total)}
                </span>
              </div>
              <button
                className="flex h-12 w-full items-center justify-center rounded-lg bg-[#1e40af] px-4 text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c] disabled:opacity-60"
                disabled={checkout.isPending}
                type="submit"
              >
                {checkout.isPending
                  ? 'Membuat Pesanan...'
                  : checkout.paymentMethod === 'qris'
                    ? 'Lanjut ke Pembayaran'
                    : 'Buat Pesanan'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </main>
  )
}

function PaymentMethodOption({
  description,
  disabled = false,
  isSelected,
  label,
  method,
  onSelect,
}: {
  description: string
  disabled?: boolean
  isSelected: boolean
  label: string
  method: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}) {
  return (
    <button
      className={[
        'w-full rounded-lg border p-3 text-left transition disabled:cursor-not-allowed',
        isSelected
          ? 'border-[#1e40af] bg-blue-50'
          : 'border-slate-200 bg-white hover:border-blue-200',
        disabled ? 'bg-slate-50 opacity-55 hover:border-slate-200' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      onClick={() => onSelect(method)}
      type="button"
    >
      <span className="flex items-center gap-3">
        <span
          className={[
            'flex size-5 shrink-0 items-center justify-center rounded-full border',
            isSelected ? 'border-[#1e40af]' : 'border-slate-200',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isSelected ? (
            <span className="size-3 rounded-full bg-[#1e40af]" />
          ) : null}
        </span>
        <span>
          <span className="block text-sm font-medium leading-5 text-slate-800">
            {label}
          </span>
          <span className="block text-xs leading-4 text-slate-500">
            {description}
          </span>
        </span>
      </span>
    </button>
  )
}

function CheckoutLoadingPage({
  backTarget,
}: {
  backTarget: CheckoutBackTarget
}) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-sm bg-white">
        <header className="sticky top-0 z-10 bg-[#1e40af] px-3 py-2 text-white">
          <div className="flex h-10 items-center gap-3">
            <CheckoutBackIconLink target={backTarget} />
            <h1 className="text-xl font-medium leading-7">Checkout</h1>
          </div>
        </header>
        <div className="space-y-4 px-4 py-4">
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-36 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    </main>
  )
}

function CheckoutEmptyPage({
  backTarget,
  description,
  title,
}: {
  backTarget: CheckoutBackTarget
  description: string
  title: string
}) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-sm bg-white">
        <header className="sticky top-0 z-10 bg-[#1e40af] px-3 py-2 text-white">
          <div className="flex h-10 items-center gap-3">
            <CheckoutBackIconLink target={backTarget} />
            <h1 className="text-xl font-medium leading-7">Checkout</h1>
          </div>
        </header>
        <section className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <h2 className="text-lg font-medium leading-7 text-slate-800">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          <CheckoutBackTextLink target={backTarget} />
        </section>
      </div>
    </main>
  )
}

function getDirectCheckoutBackTarget(
  search: CheckoutSearch,
): CheckoutBackTarget {
  if (search.returnTo === 'product' && search.productId) {
    return {
      params: {
        productId: search.productId,
      },
      to: '/products/$productId',
    }
  }

  if (search.productId) {
    return {
      params: {
        productId: search.productId,
      },
      to: '/products/$productId',
    }
  }

  return {
    to: '/',
  }
}

function CheckoutBackIconLink({ target }: { target: CheckoutBackTarget }) {
  const className =
    'flex size-10 items-center justify-center rounded-full transition hover:bg-white/10'

  if (target.to === '/products/$productId') {
    return (
      <Link
        aria-label="Kembali"
        className={className}
        params={target.params}
        to={target.to}
      >
        <ArrowLeft aria-hidden="true" className="size-6" />
      </Link>
    )
  }

  return (
    <Link aria-label="Kembali" className={className} to={target.to}>
      <ArrowLeft aria-hidden="true" className="size-6" />
    </Link>
  )
}

function CheckoutBackTextLink({ target }: { target: CheckoutBackTarget }) {
  const className =
    'mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c]'

  if (target.to === '/products/$productId') {
    return (
      <Link className={className} params={target.params} to={target.to}>
        Kembali
      </Link>
    )
  }

  return (
    <Link className={className} to={target.to}>
      Kembali
    </Link>
  )
}
