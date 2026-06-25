import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { CartContext } from './context/CartContext'
import Home from './pages/Home'
import Market from './pages/Market'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import NneAI from './pages/NneAI'
import AhiaQuiz from './pages/AhiaQuiz'
import AgentApp from './agent/AgentApp'
import OwnerApp from './owner/OwnerApp'

export default function App() {
  const [cartItems, setCartItems] = useState([])

  function addToCart(product) {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  function removeFromCart(productId) {
    setCartItems(prev => prev.filter(i => i.id !== productId))
  }

  function updateQty(productId, qty) {
    if (qty < 1) return removeFromCart(productId)
    setCartItems(prev => prev.map(i => i.id === productId ? { ...i, qty } : i))
  }

  function clearCart() { setCartItems([]) }

  const cartTotal = cartItems.reduce((sum, i) => sum + (i.price * i.qty), 0)
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, cartCount, addToCart, removeFromCart, updateQty, clearCart }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/market" element={<Market />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/nne" element={<NneAI />} />
        <Route path="/quiz" element={<AhiaQuiz />} />
        <Route path="/agent/*" element={<AgentApp />} />
        <Route path="/owner/*" element={<OwnerApp />} />
      </Routes>
    </CartContext.Provider>
  )
}
