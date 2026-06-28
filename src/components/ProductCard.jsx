import { ShoppingBasket } from 'lucide-react'
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

// ============================================
// CATEGORY-AWARE SUBTITLE
// Only shows on market days — not on rest days
// ============================================
function getFreshLabel(categorySlug, isMeat) {
  if (isMeat) return 'Processed fresh on market day'
  switch (categorySlug) {
    case 'vegetables': return 'Harvested this morning'
    case 'fruits':
    case 'seasonal': return 'Picked this morning'
    case 'grains': return 'Harvested fresh'
    case 'staples': return 'From the village farm'
    case 'palm': return 'Pressed this week'
    case 'protein': return 'Sun-dried and sorted'
    case 'spices': return 'Fresh from the farm'
    case 'nuts': return 'Hand-sorted'
    default: return 'From the village market'
  }
}

export default function ProductCard({
  product,
  unavailableToday = false,
  orderingState = 'browse_only',
  onMeatOptionsClick,
  showMarketLabel = false,
}) {
  const { addToCart, cartItems } = useCart()
  const inCart = cartItems?.find(i => i.id === product.id)
  const isSoldOut = (product.quantity_available ?? 1) <= 0
  const isMeat = product.is_meat || product.category_slug === 'meat'
  const isHighValue = product.is_high_value || isMeat
  const isDisabled = isSoldOut || unavailableToday || orderingState === 'browse_only'
  const placeholderEmoji = CATEGORY_EMOJI[product.category_slug] || '🌿'

  // Only show market name + fresh label when a market is actually active
  // On rest days (browse_only with no listing) — show nothing
  const isMarketActive = orderingState === 'same_day' || orderingState === 'preorder'
  const freshLabel = getFreshLabel(product.category_slug, isMeat)

  function handleAdd() {
    if (isDisabled) return
    if (isHighValue || isMeat) {
      onMeatOptionsClick && onMeatOptionsClick(product)
      return
    }
    addToCart(product)
    toast.success(`${product.name} added`)
  }

  function getButtonLabel() {
    if (unavailableToday) return 'Other market'
    if (isSoldOut) return 'Sold out'
    if (orderingState === 'browse_only') return 'Not open yet'
    if (isHighValue || isMeat) return 'Options'
    if (inCart) return `In basket (${inCart.qty})`
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

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        opacity: unavailableToday ? 0.45 : 1,
        filter: unavailableToday ? 'grayscale(60%)' : 'none',
      }}
    >
      {/* Image area */}
      <div style={{
        height: 130,
        background: product.image_url
          ? `url(${product.image_url}) center/cover no-repeat`
          : 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {!product.image_url && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 40,
          }}>
            {placeholderEmoji}
          </div>
        )}

        {/* Badges top-left */}
        <div style={{
          position: 'absolute', top: 6, left: 6,
          display: 'flex', flexDirection: 'column', gap: 3,
        }}>
          {product.is_preorder_only && (
            <span style={{
              background: 'var(--orange)', color: 'white',
              fontSize: 9, fontWeight: 700, padding: '2px 7px',
              borderRadius: 10, letterSpacing: 0.5,
            }}>
              Pre-order
            </span>
          )}
          {product.is_bulk && (
            <span style={{
              background: 'rgba(0,0,0,0.6)', color: 'white',
              fontSize: 9, fontWeight: 700, padding: '2px 7px',
              borderRadius: 10,
            }}>
              📦 Bulk
            </span>
          )}
          {product.is_seasonal && (
            <span style={{
              background: 'var(--gold)', color: 'white',
              fontSize: 9, fontWeight: 700, padding: '2px 7px',
              borderRadius: 10,
            }}>
              ⭐ Season
            </span>
          )}
          {!isSoldOut && !unavailableToday
            && (product.quantity_available > 0)
            && product.quantity_available <= 3 && (
            <span style={{
              background: '#ff4444', color: 'white',
              fontSize: 9, fontWeight: 700, padding: '2px 7px',
              borderRadius: 10,
            }}>
              Only {product.quantity_available} left
            </span>
          )}
        </div>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              color: 'white', fontWeight: 700,
              fontSize: 13, letterSpacing: 2,
            }}>
              SOLD OUT
            </span>
          </div>
        )}

        {/* Other market overlay */}
        {unavailableToday && !isSoldOut && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 8px',
          }}>
            <span style={{
              color: 'white', fontWeight: 700,
              fontSize: 10, textAlign: 'center', lineHeight: 1.4,
            }}>
              {product.market_name} day only
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{
        padding: '10px 12px 12px',
        flex: 1, display: 'flex',
        flexDirection: 'column', gap: 4,
      }}>

        {/* ============================================
            SUBTITLE — only shows when market is active
            On rest days: nothing shows here at all
            On market day: shows market name + correct label
            ============================================ */}
        {isMarketActive && (
          <div style={{
            fontSize: 10, color: '#888',
            display: 'flex', alignItems: 'center',
            gap: 4, flexWrap: 'wrap',
            lineHeight: 1.2,
          }}>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>
              {product.market_name || 'Village Market'}
            </span>
            <span>•</span>
            <span>{freshLabel}</span>
          </div>
        )}

        {/* Product name */}
        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 14, fontWeight: 700,
          color: 'var(--charcoal)', lineHeight: 1.25,
          margin: 0,
        }}>
          {product.name}
        </h3>

        {/* Season note */}
        {product.season_note && (
          <p style={{
            fontSize: 10, color: 'var(--gold)',
            fontWeight: 500, margin: 0, lineHeight: 1.3,
          }}>
            {product.season_note}
          </p>
        )}

        {/* Short description — only if no season note */}
        {product.description && !product.season_note && (
          <p style={{
            fontSize: 10, color: '#666',
            lineHeight: 1.4, margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.description}
          </p>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Price + button */}
        <div style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between', gap: 6,
          marginTop: 6,
        }}>
          <div>
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 16, fontWeight: 700,
              color: 'var(--green)', lineHeight: 1,
            }}>
              {formatNaira(product.price)}
            </div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
              per {product.unit}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isDisabled}
            style={{
              background: getButtonColor(),
              color: 'white', border: 'none',
              borderRadius: 8, padding: '7px 10px',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {!isHighValue && !isMeat && !isDisabled && (
              <ShoppingBasket size={11} />
            )}
            {getButtonLabel()}
          </button>
        </div>
      </div>
    </div>
  )
}
