import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  note: string
  photoUrl: string | null
  price: number
  productId: string
  productName: string
  quantity: number
  storeId: string
  storeName: string
}

type CartState = {
  items: Array<CartItem>
}

type CartActions = {
  addItem: (item: CartItem) => void
  clearCart: () => void
  removeItem: (productId: string) => void
}

type CartStore = CartState & CartActions

const initialCartState: CartState = {
  items: [],
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      ...initialCartState,
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.note.trim() === item.note.trim(),
          )

          if (!existingItem) {
            return {
              items: [...state.items, item],
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
          }
        }),
      clearCart: () => set(initialCartState),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
    }),
    {
      name: 'food-umkm-hub-cart',
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
)
