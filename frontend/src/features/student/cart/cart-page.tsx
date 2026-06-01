import { Link } from '@tanstack/react-router'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

import { useCartStore } from '../../../stores/cart-store'
import { formatRupiah } from '../browse/format'
import { CartItemCard } from './cart-item-card'
import { getCartItemCount, getCartSubtotal } from './cart-selectors'
import { CartSummary } from './cart-summary'

type CartPageProps = {
  searchStoreId?: string
}

export function CartPage({ searchStoreId }: CartPageProps) {
  const items = useCartStore((state) => state.items)
  const cartStoreId = useCartStore((state) => state.storeId)
  const storeName = useCartStore((state) => state.storeName)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const itemCount = getCartItemCount(items)
  const subtotal = getCartSubtotal(items)
  const backStoreId = cartStoreId ?? searchStoreId

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col bg-white">
        <header className="sticky top-0 z-10 bg-[#1e40af] px-3 py-2 text-white">
          <div className="flex h-10 items-center gap-3">
            <CartBackLink storeId={backStoreId} />
            <h1 className="text-xl font-medium leading-7">Keranjang</h1>
          </div>
        </header>

        {items.length === 0 ? (
          <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-blue-50 text-[#1e40af]">
              <ShoppingBag aria-hidden="true" className="size-8" />
            </div>
            <h2 className="mt-4 text-lg font-medium leading-7 text-slate-800">
              Keranjang kosong
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pilih produk dari UMKM favorit Anda untuk mulai memesan.
            </p>
            <Link
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-[#1e40af] px-4 text-sm font-medium leading-5 text-white transition hover:bg-[#1d3a9c]"
              to="/"
            >
              Cari Produk
            </Link>
          </section>
        ) : (
          <>
            <div className="flex-1 space-y-4 px-4 py-4 pb-36">
              {storeName ? (
                <section className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs leading-4 text-blue-700">UMKM</p>
                  <p className="mt-1 text-sm font-medium leading-5 text-slate-800">
                    {storeName}
                  </p>
                </section>
              ) : null}

              <section className="space-y-3">
                {items.map((item) => (
                  <CartItemCard
                    item={item}
                    key={`${item.productId}:${item.note.trim()}`}
                    onQuantityChange={(quantity) =>
                      updateQuantity(item.productId, item.note, quantity)
                    }
                    onRemove={() => removeItem(item.productId, item.note)}
                    storeName={storeName ?? 'UMKM'}
                  />
                ))}
              </section>

              <CartSummary itemCount={itemCount} subtotal={subtotal} />
            </div>

            <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-sm border-t border-slate-200 bg-white px-4 py-4 shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm leading-5 text-slate-500">Total</span>
                <span className="text-xl leading-7 text-[#1e40af]">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <Link
                className="mt-3 flex h-12 w-full items-center justify-center rounded-lg bg-[#1e40af] px-4 text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c]"
                search={{
                  returnTo: 'cart',
                }}
                to="/checkout"
              >
                Lanjut ke Checkout ({itemCount} item)
              </Link>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}

function CartBackLink({ storeId }: { storeId?: string }) {
  const className =
    'flex size-10 items-center justify-center rounded-full transition hover:bg-white/10'

  if (storeId) {
    return (
      <Link
        aria-label="Kembali"
        className={className}
        params={{ storeId }}
        to="/stores/$storeId"
      >
        <ArrowLeft aria-hidden="true" className="size-6" />
      </Link>
    )
  }

  return (
    <Link aria-label="Kembali" className={className} to="/stores">
      <ArrowLeft aria-hidden="true" className="size-6" />
    </Link>
  )
}
