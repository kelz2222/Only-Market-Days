import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBasket, ArrowRight, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { formatNaira, calculateServiceFee } from '../lib/paystack'
import { isOrderOpen, isPreorderOpen, getTodaysMarket, getNextMarket, formatMarketDate } from '../lib/marketCalendar'

export default function Cart() {
  const { cartItems, cartTotal, updateQty, removeFromCart } = useCart()
  const navigate = useNavigate()
  const now = new Date()
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)
  const canOrder = orderOpen || preorderOpen
  const orderType = preorderOpen && !orderOpen ? 'preorder' : 'same_day'
  const serviceFee = calculateServiceFee(orderType, cartTotal)
  const deliveryFeeAba = 80000
  const deliveryFeeUmuahia = 120000
  const { market: nextMarket, date: nextDate } = getNextMarket(now)

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 80 }}>
        <Navbar />
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, marginBottom: 12 }}>Your basket is empty</h2>
          <p style={{ color: '#666', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Head to the market and add some fresh produce from Isiala Ngwa North.
          </p>
          <Link to="/market" className="btn-primary">
            <ShoppingBasket size={18} />Browse the Market
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 120 }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px' }}>
        <Link to="/market" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 14, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to market
        </Link>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Your Basket</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} from Isiala Ngwa North</p>

        {canOrder ? (
          <div style={{ background: orderType === 'preorder' ? 'rgba(212,160,23,0.1)' : 'rgba(27,67,50,0.08)', border: `1px solid ${orderType === 'preorder' ? 'var(--gold)' : 'var(--green-muted)'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: orderType === 'preorder' ? '#8B6914' : 'var(--green)' }}>
            {orderType === 'preorder' ? '🌅 Pre-order — your items are secured first at 5AM tomorrow. Closes 10PM tonight.' : '🌿 Same-day order — market is open now. Order before 10AM.'}
          </div>
        ) : (
          <div style={{ background: 'rgba(45,45,45,0.06)', border: '1px solid #ddd', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#666' }}>
            🌙 Market is closed. Your order will be placed for the next market day: <strong>{nextMarket.name}</strong> — {formatMarketDate(nextDate)}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {cartItems.map(item => (
            <div key={item.id} className="card" style={{ padding: '16px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                {item.category_emoji || '🌿'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>per {item.unit}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)', marginTop: 4 }}>{formatNaira(item.price * item.qty)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', padding: 4, color: '#ccc' }}>
                  <Trash2 size={15} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={13} />
                  </button>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, width: 20, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, marginBottom: 16 }}>Order Summary</h3>
          {[
            { label: 'Subtotal', value: formatNaira(cartTotal) },
            { label: `Service fee (${orderType === 'preorder' ? 'pre-order' : 'same-day'})`, value: formatNaira(serviceFee) },
            { label: 'Delivery — Aba', value: formatNaira(deliveryFeeAba) },
            { label: 'Delivery — Umuahia', value: formatNaira(deliveryFeeUmuahia) },
          ].map(({ label, value }, i) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: i === 0 ? 'var(--charcoal)' : '#666', marginBottom: 10, paddingBottom: i === 1 ? 10 : 0, borderBottom: i === 1 ? '1px solid var(--cream-dark)' : 'none' }}>
              <span>{label}</span>
              <span style={{ fontFamily: 'DM Mono, monospace' }}>{value}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#888', marginBottom: 16 }}>* Final delivery fee depends on your pickup zone — selected at checkout</div>

          {cartTotal < 350000 && (
            <div style={{ background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--orange)', marginBottom: 16 }}>
              Minimum order is ₦3,500. Add {formatNaira(350000 - cartTotal)} more to checkout.
            </div>
          )}

          <button onClick={() => cartTotal >= 350000 && navigate('/checkout')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, opacity: cartTotal < 350000 ? 0.5 : 1, cursor: cartTotal < 350000 ? 'not-allowed' : 'pointer' }}>
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
