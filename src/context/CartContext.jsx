import { createContext, useContext } from 'react'

export const CartContext = createContext({
  cartItems: [],
  cartTotal: 0,
  cartCount: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQty: () => {},
  clearCart: () => {},
})

export const useCart = () => useContext(CartContext)
