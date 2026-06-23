import { ShoppingBasket, Leaf } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatNaira } from '../lib/paystack'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart()
  const inCart = cartItems.find(i => i.id === product.id)
  const isSoldOut = product.quantity_available <= 0

  function handleAdd() {
    if (isSoldOut) return
    addToCart(product)
    toast.success(`${product.name} added to basket`)
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: isSoldOut ? 'not-allowed' : 'pointer', opacity: isSoldOut ? 0.6 : 1 }}
      onMouseEnter={e => !isSoldOut && (e.currentTarget.style.transform = 'translateY(-3px)')}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}>

      <div style={{ height: 160, background: product.image_url ? `url(${product.image_url}) center/cover` : 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)', position: 'relative', overflow: 'hidden' }}>
        {!product.image_url && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
            {product.category_emoji || '🌿'}
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {product.is_seasonal && <span className="badge badge-season">⭐ Season</span>}
          {product.is_bulk && <span className="badge badge-bulk">📦 Bulk</span>}
          {product.is_preorder_only && <span className="badge badge-preorder">Pre-order</span>}
          {product.quantity_available <= 3 && !isSoldOut && (
            <span className="badge" style={{ background: '#ff4444', color: 'white' }}>Only {product.quantity_available} left</span>
          )}
        </div>
        {isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: 2 }}>SOLD OUT</span>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Leaf size={11} />{product.market_name || 'Orie Ntigha'} • Harvested this morning
        </div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.2 }}>{product.name}</h3>
        {product.season_note && <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 500 }}>{product.season_note}</p>}
        {product.description && <p style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>{product.description}</p>}
        <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{formatNaira(product.price)}</div>
            <div style={{ fontSize: 11, color: '#888' }}>per {product.unit}</div>
          </div>
          <button onClick={handleAdd} disabled={isSoldOut} style={{ background: inCart ? 'var(--green)' : 'var(--orange)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: isSoldOut ? 'not-allowed' : 'pointer' }}>
            <ShoppingBasket size={15} />{inCart ? `In basket (${inCart.qty})` : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
