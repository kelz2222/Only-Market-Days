import { ShoppingBasket, Leaf, Flame, Fish } from 'lucide-react'
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

// Category-aware subtitle — no more "Harvested this morning" on palm oil
function getFreshLabel(categorySlug, isMeat) {
  if (isMeat) return 'Processed fresh on market day'
  switch (categorySlug) {
    case 'vegetables': return 'Harvested this morning'
    case 'fruits':
    case 'seasonal': return 'Picked this morning'
    case 'grains': return 'Harvested fresh'
    case 'staples': return 'From the village farm'
    case 'palm': return 'Pressed this week'
    case 'protein': return 'Sun-dried & sorted'
    case 'spices': return 'Fresh from the farm'
    case 'nuts': return 'Hand-sorted'
    default: return 'Fresh from the market'
  }
}

const MEAT_SLUGS = ['meat']

export default function ProductCard({
  product,
  unavailableToday = false,
  orderingState = 'browse_only',
  onMeatOptionsClick,
}) {
  const { addToCart, cartItems } = useCart()
  const inCart = cartItems.find(i => i.id === product.id)
  const isSoldOut = product.quantity_available <= 0
  const isMeat = product.is_meat || MEAT_SLUGS.includes(product.category_slug)
  const isHighValue = product.is_high_value
  const isDisabled = isSoldOut || unavailableToday || orderingState === 'browse_only'
  const placeholderEmoji = CATEGORY_EMOJI[product.category_slug] || '🌿'

  // Category-aware subtitle
  const freshLabel = getFreshLabel(product.category_slug, isMeat)

  function handleAdd() {
    if (isDisabled) return
    if (isHighValue || isMeat) {
      onMeatOptionsClick && onMeatOptionsClick(product)
      return
    }
    addToCart(product)
    toast.success(`${product.name} added to basket`)
  }

  function getButtonLabel() {
    if (unavailableToday) return 'Other market'
    if (isSoldOut) return 'Sold out'
    if (orderingState === 'browse_only') return 'Not open yet'
    if (isHighValue || isMeat) return '⚙️ Options'
    if (inCart) return `(${inCart.qty})`
    if (orderingState === 'preorder') return 'Pre-order'
    return 'Add'
  }

  function getButtonColor() {
    if (isDisabled) return '#ccc'
    if (isHighValue || isMeat) return 'var(--charcoal)'
    if (inCart) return 'var(--green)'
    if (orderingState === 'preorder') return '#2D6A4F'
    return 'var(--orange)'
  }

  // Subtitle icon based on category
  function getSubtitleIcon() {
    if (isMeat) return <Flame size={10} />
    if (['protein'].includes(product.category_slug)) return <Fish size={10} />
    return <Leaf size={10} />
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: unavailableToday ? 0.45 : 1,
        filter: unavailableToday ? 'grayscale(60%)' : 'none',
      }}
      onMouseEnter={e => !isDisabled && (e.currentTarget.style.transform = 'translateY(-3px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      {/* Image */}
      <div style={{
        height: 150,
        background: product.image_url
          ? `url(${product.image_url}) center/cover`
          : 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {!product.image_url && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 44,
          }}>
            {placeholderEmoji}
          </div>
        )}

        {/* Badges */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          display: 'flex', gap: 4, flexWrap: 'wrap',
        }}>
          {product.is_seasonal && (
            <span className="badge badge-season">⭐ Season</span>
          )}
          {product.is_bulk && (
            <span className="badge badge-bulk">📦 Bulk</span>
          )}
          {product.is_preorder_only && (
            <span className="badge badge-preorder">Pre-order</span>
          )}
          {product.quantity_available <= 3 && !isSoldOut && !unavailableToday && (
            <span className="badge" style={{ background: '#ff4444', color: 'white' }}>
              Only {product.quantity_available} left
            </span>
          )}
        </div>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>
              SOLD OUT
            </span>
          </div>
        )}

        {/* Other market overlay */}
        {unavailableToday && !isSoldOut && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 8px',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 11, textAlign: 'center' }}>
              {product.market_name} day only
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        padding: '12px 14px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}>

        {/* Subtitle — market name + category-aware label */}
        <div style={{
          fontSize: 10,
          color: 'var(--green)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'wrap',
        }}>
          {getSubtitleIcon()}
          <span>{product.market_name || 'Village Market'}</span>
          <span style={{ color: '#aaa', fontWeight: 400 }}>•</span>
          <span style={{ color: '#888', fontWeight: 400 }}>{freshLabel}</span>
        </div>

        {/* Product name */}
        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 15, fontWeight: 700,
          color: 'var(--charcoal)', lineHeight: 1.2,
          margin: 0,
        }}>
          {product.name}
        </h3>

        {/* Season note */}
        {product.season_note && (
          <p style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 500, margin: 0 }}>
            {product.season_note}
          </p>
        )}

        {/* Description — only show if no season note to keep cards compact */}
        {product.description && !product.season_note && (
          <p style={{ fontSize: 11, color: '#666', lineHeight: 1.4, margin: 0 }}>
            {product.description}
          </p>
        )}

        {/* Price + button */}
        <div style={{
          marginTop: 'auto', paddingTop: 8,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 6,
        }}>
          <div>
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 17, fontWeight: 700,
              color: 'var(--green)',
            }}>
              {formatNaira(product.price)}
            </div>
            <div style={{ fontSize: 10, color: '#888' }}>
              per {product.unit}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isDisabled}
            style={{
              background: getButtonColor(),
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {!isHighValue && !isMeat && !isDisabled && inCart && (
              <ShoppingBasket size={12} />
            )}
            {getButtonLabel()}
          </button>
        </div>
      </div>
    </div>
  )
}
