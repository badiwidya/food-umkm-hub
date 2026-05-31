import type { CartItem } from '../../../stores/cart-store'

export function getCartItemCount(items: Array<CartItem>) {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function getCartSubtotal(items: Array<CartItem>) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}
