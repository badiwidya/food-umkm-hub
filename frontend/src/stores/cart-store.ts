import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  note: string
  photoUrl: string | null
  price: number
  productId: string
  productName: string
  quantity: number
}

type CartState = {
  items: Array<CartItem>
  storeId: string | null
  storeName: string | null
}

type CartActions = {
  addItem: (item: CartItem, store: CartStoreInfo) => void
  clearCart: () => void
  removeItem: (productId: string, note: string) => void
  replaceCart: (item: CartItem, store: CartStoreInfo) => void
  updateQuantity: (productId: string, note: string, quantity: number) => void
}

type CartStore = CartState & CartActions

export type CartStoreInfo = {
  storeId: string
  storeName: string
}

const initialCartState: CartState = {
  items: [],
  storeId: null,
  storeName: null,
}

type LegacyCartItem = CartItem & CartStoreInfo

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLegacyCartItem(value: unknown): value is LegacyCartItem {
  return (
    isRecord(value) &&
    typeof value.note === 'string' &&
    (typeof value.photoUrl === 'string' || value.photoUrl === null) &&
    typeof value.price === 'number' &&
    typeof value.productId === 'string' &&
    typeof value.productName === 'string' &&
    typeof value.quantity === 'number' &&
    typeof value.storeId === 'string' &&
    typeof value.storeName === 'string'
  )
}

function isCartItem(value: unknown): value is CartItem {
  return (
    isRecord(value) &&
    typeof value.note === 'string' &&
    (typeof value.photoUrl === 'string' || value.photoUrl === null) &&
    typeof value.price === 'number' &&
    typeof value.productId === 'string' &&
    typeof value.productName === 'string' &&
    typeof value.quantity === 'number'
  )
}

function getCartItemKey(item: Pick<CartItem, 'note' | 'productId'>) {
  return `${item.productId}:${item.note.trim()}`
}

function normalizePersistedCartState(value: unknown): CartState {
  if (!isRecord(value)) {
    return initialCartState
  }

  const rawItems = Array.isArray(value.items) ? value.items : []
  const items = rawItems.filter(isCartItem).map((item) => ({
    note: item.note,
    photoUrl: item.photoUrl,
    price: item.price,
    productId: item.productId,
    productName: item.productName,
    quantity: Math.max(1, item.quantity),
  }))
  const legacyFirstItem = rawItems.find(isLegacyCartItem)
  const storeId =
    typeof value.storeId === 'string'
      ? value.storeId
      : (legacyFirstItem?.storeId ?? null)
  const storeName =
    typeof value.storeName === 'string'
      ? value.storeName
      : (legacyFirstItem?.storeName ?? null)

  if (items.length === 0 || !storeId || !storeName) {
    return initialCartState
  }

  return {
    items,
    storeId,
    storeName,
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      ...initialCartState,
      addItem: (item, store) =>
        set((state) => {
          const existingItem = state.items.find(
            (cartItem) => getCartItemKey(cartItem) === getCartItemKey(item),
          )

          if (!existingItem) {
            return {
              items: [...state.items, item],
              storeId: store.storeId,
              storeName: store.storeName,
            }
          }

          return {
            items: state.items.map((cartItem) =>
              cartItem === existingItem
                ? {
                    ...cartItem,
                    quantity: cartItem.quantity + item.quantity,
                  }
                : cartItem,
            ),
            storeId: store.storeId,
            storeName: store.storeName,
          }
        }),
      clearCart: () => set(initialCartState),
      removeItem: (productId, note) =>
        set((state) => {
          const nextItems = state.items.filter(
            (item) =>
              getCartItemKey(item) !== getCartItemKey({ note, productId }),
          )

          if (nextItems.length === 0) {
            return initialCartState
          }

          return {
            items: nextItems,
          }
        }),
      replaceCart: (item, store) =>
        set({
          items: [item],
          storeId: store.storeId,
          storeName: store.storeName,
        }),
      updateQuantity: (productId, note, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            getCartItemKey(item) === getCartItemKey({ note, productId })
              ? {
                  ...item,
                  quantity: Math.max(1, quantity),
                }
              : item,
          ),
        })),
    }),
    {
      migrate: normalizePersistedCartState,
      name: 'food-umkm-hub-cart',
      partialize: (state) => ({
        items: state.items,
        storeId: state.storeId,
        storeName: state.storeName,
      }),
      version: 1,
    },
  ),
)
