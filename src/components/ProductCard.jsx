import { ShoppingBasket, Leaf, Flame } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatNaira } from '../lib/paystack'
import toast from 'react-hot-toast'

const CATEGORY_EMOJI = {
  vegetables: '🌿',
  staples: '🌾',
  palm: '🫙',
  protein: '🦐',
  meat: '🐔',
  spices: '🌶️',
  fruits: '🍌',
  seasonal: '🍊',
  nuts: '🌰',
  grains: '🌽',
}

const MEAT_SLUGS = ['meat']

export default function ProductCard({ product, unavailableToday = false, orderingState = 'browse_only', onMeatOptionsClick }) {
  const { addToCart, cartItems } = useCart()
  const inCart = cartItems.find(i => i.id === product.id)
  const isSoldOut = product.quantity_available <= 0
  const isMeat = product.is_meat || MEAT_SLUGS.includes(product.category_slug)
  const isHighValue = product.is_high_value
  const isDisabled = isSoldOut || unavailableToday || orderingState === 'browse_only'
  const freshLabel = isMeat ? 'Processed fresh this morning' : 'Harvested this morning'
  const placeholderEmoji = CATEGORY_EMOJI[product.category_slug] || '🌿'

  function handleAdd() {
    if (isDisabled) return
    if (isHighValue || isMeat) {
      onMeatOptionsClick && onMeatOptionsClick(product)
      return
    }
    addToCart(product)
    toast.success(`${product.name} added to basket`)
  }

  // Button label
  function getButtonLabel() {
    if (unavailableToday) return 'Other market'
    if (isSoldOut) return 'Sold out'
    if (orderingState === 'browse_only') return 'Not open yet'
    if (isHighValue || isMeat) return '⚙️ Options'
    if (inCart) return `In basket (${inCart.qty})`
    if (orderingState === 'preorder') return 'Pre-order'
    return 'Add'
  }

  // Button color
  function getButtonColor() {
    if (isDisabled) return '#ccc'
    if (isHighValue || isMeat) return 'var(--charcoal)'
    if (inCart) return 'var(--green)'
    if (orderingState === 'preorder') return '#2D6A4F'
    return 'var(--orange)'
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.2s',
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: unavailableToday ? 0.45 : 1,
        filter: unavailableToday ? 'grayscale(60%)' : 'none',
      }}
      onMouseEnter={e => !isDisabled && (e.currentTarget.style.transform = 'translateY(-3px)')}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      {/* Image */}
      <div style={{
        height: 150,
        background: product.image_url
          ? `url(${product.image_url}) center/cover`
          : 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {!product.image_url && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
            {placeholderEmoji}
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {product.is_seasonal && <span className="badge badge-season">⭐ Season</span>}
          {product.is_bulk && <span className="badge badge-bulk">📦 Bulk</span>}
          {product.is_preorder_only && <span className="badge badge-preorder">Pre-order</span>}
          {product.quantity_available <= 3 && !isSoldOut && !unavailableToday && (
            <span className="badge" style={{ background: '#ff4444', color: 'white' }}>
              Only {product.quantity_available} left
            </span>
          )}
        </div>

        {/* Overlays */}
        {isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>SOLD OUT</span>
          </div>
        )}
        {unavailableToday && !isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 11, textAlign: 'center' }}>
              {product.market_name} day only
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          {isMeat ? <Flame size={10} /> : <Leaf size={10} />}
          {product.market_name} • {freshLabel}
        </div>

        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.2 }}>
          {product.name}
        </h3>

        {product.season_note && (
          <p style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 500 }}>{product.season_note}</p>
        )}

        {product.description && (
          <p style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>{product.description}</p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--green)' }}>
              {formatNaira(product.price)}
            </div>
            <div style={{ fontSize: 10, color: '#888' }}>per {product.unit}</div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isDisabled}
            style={{
              background: getButtonColor(),
              color: 'white', border: 'none', borderRadius: 8,
              padding: '8px 10px',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {!isHighValue && !isMeat && !isDisabled && <ShoppingBasket size={12} />}
            {getButtonLabel()}
          </button>
        </div>
      </div>
    </div>
  )
}
