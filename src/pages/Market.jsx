import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, Clock, ShoppingBasket } from 'lucide-react'
import Navbar from '../components/Navbar'
import CountdownBanner from '../components/CountdownBanner'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import {
  getTodaysMarket,
  getTomorrowsMarket,
  getNextMarket,
  formatMarketDate,
  isOrderOpen,
  isPreorderOpen,
  isListingVisible,
  getOrderingState,
  getActiveListingMarket,
  TIMING,
} from '../lib/marketCalendar'
import { formatNaira } from '../lib/paystack'
import toast from 'react-hot-toast'

const MEAT_OPTIONS = {
  chicken: {
    cutting: [
      'Whole (no cutting)',
      'Cut in 2 halves',
      'Cut in 4 pieces',
      'Cut in 8 chunks',
      'Chopped small for stew',
    ],
    packaging: [
      'Standard nylon bag',
      'Food-grade sealed bag (recommended)',
    ],
  },
  goat: {
    cutting: [
      'Whole half (no cutting)',
      'Cut in 4 large pieces',
      'Cut in 8 pieces',
      'Chopped small for pepper soup',
      'Chopped small for stew',
    ],
    packaging: [
      'Standard nylon bag',
      'Food-grade sealed bag (recommended)',
    ],
  },
}

const CATEGORIES = [
  { slug: 'all', name: 'All', emoji: '🛒' },
  { slug: 'vegetables', name: 'Vegetables', emoji: '🌿' },
  { slug: 'staples', name: 'Staples', emoji: '🌾' },
  { slug: 'palm', name: 'Palm', emoji: '🫙' },
  { slug: 'protein', name: 'Protein', emoji: '🦐' },
  { slug: 'meat', name: 'Meat', emoji: '🐔' },
  { slug: 'spices', name: 'Spices', emoji: '🌶️' },
  { slug: 'fruits', name: 'Fruits', emoji: '🍌' },
  { slug: 'seasonal', name: 'Seasonal', emoji: '🍊' },
  { slug: 'nuts', name: 'Nuts', emoji: '🌰' },
  { slug: 'grains', name: 'Grains', emoji: '🌽' },
]

// Maps category slug to emoji for placeholder
const CATEGORY_EMOJI_MAP = {
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
// MEAT OPTIONS MODAL
// ============================================
function MeatOptionsModal({ product, orderType, onClose, onAdd }) {
  const options = MEAT_OPTIONS[product.meat_type] || MEAT_OPTIONS.chicken
  const [cutting, setCutting] = useState('')
  const [packaging, setPackaging] = useState('')

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white',
        borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 500,
        padding: '24px',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{
          width: 40, height: 4, background: '#ddd',
          borderRadius: 2, margin: '0 auto 20px',
        }} />

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: 6,
        }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 22, fontWeight: 700,
          }}>
            {product.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--cream-dark)', border: 'none',
              borderRadius: 8, padding: 8, cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
          {product.description}
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: orderType === 'preorder'
            ? 'rgba(212,160,23,0.1)'
            : 'rgba(27,67,50,0.08)',
          border: `1px solid ${orderType === 'preorder' ? 'var(--gold)' : 'var(--green-muted)'}`,
          borderRadius: 8, padding: '6px 12px', marginBottom: 20,
          fontSize: 12,
          color: orderType === 'preorder' ? '#8B6914' : 'var(--green)',
        }}>
          {orderType === 'preorder'
            ? '🌅 This is a pre-order — secured at 5AM tomorrow'
            : '🌿 Same-day order'}
        </div>

        {/* Cutting style */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            How would you like it cut?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {options.cutting.map(opt => (
              <label key={opt} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px',
                border: `2px solid ${cutting === opt ? 'var(--green)' : 'var(--cream-dark)'}`,
                borderRadius: 10, cursor: 'pointer',
                background: cutting === opt ? 'rgba(27,67,50,0.04)' : 'white',
              }}>
                <input
                  type="radio" name="cutting" value={opt}
                  checked={cutting === opt}
                  onChange={() => setCutting(opt)}
                  style={{ accentColor: 'var(--green)', width: 16, height: 16 }}
                />
                <span style={{ fontSize: 14 }}>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Packaging */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Packaging preference
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {options.packaging.map(opt => (
              <label key={opt} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px',
                border: `2px solid ${packaging === opt ? 'var(--green)' : 'var(--cream-dark)'}`,
                borderRadius: 10, cursor: 'pointer',
                background: packaging === opt ? 'rgba(27,67,50,0.04)' : 'white',
              }}>
                <input
                  type="radio" name="packaging" value={opt}
                  checked={packaging === opt}
                  onChange={() => setPackaging(opt)}
                  style={{ accentColor: 'var(--green)', width: 16, height: 16 }}
                />
                <span style={{ fontSize: 14 }}>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16,
          padding: '12px 0', borderTop: '1px solid var(--cream-dark)',
        }}>
          <span style={{ fontWeight: 600 }}>{product.name}</span>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 20, fontWeight: 700, color: 'var(--green)',
          }}>
            {formatNaira(product.price)}
          </span>
        </div>

        <button
          onClick={() => {
            if (cutting && packaging) {
              onAdd({
                ...product,
                cutting,
                packaging,
                notes: `Cut: ${cutting} | Pack: ${packaging}`,
              })
              onClose()
            }
          }}
          disabled={!cutting || !packaging}
          className="btn-primary"
          style={{
            width: '100%', justifyContent: 'center',
            padding: '16px', fontSize: 16,
            opacity: (!cutting || !packaging) ? 0.5 : 1,
          }}
        >
          <ShoppingBasket size={18} />
          Add to Basket — {formatNaira(product.price)}
        </button>

        {(!cutting || !packaging) && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 8 }}>
            Please select cutting style and packaging to continue
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================
// MARKET PAGE
// ============================================
export default function Market() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') || 'all'
  )
  const [sortBy, setSortBy] = useState('default')
  const [meatProduct, setMeatProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const { addToCart } = useCart()

  const now = new Date()
  const todayMarket = getTodaysMarket(now)
  const tomorrowMarket = getTomorrowsMarket(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)
  const listingVisible = isListingVisible(now)
  const orderingState = getOrderingState(now)
  const activeListingMarket = getActiveListingMarket(now)

  // ============================================
  // FETCH PRODUCTS FROM SUPABASE
  // ============================================
  useEffect(() => {
    async function fetchProducts() {
      setProductsLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, slug, emoji, name),
          market:markets(id, name, location)
        `)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        setProductsLoading(false)
        return
      }

      if (data) {
        // Map Supabase fields to what ProductCard expects
        const mapped = data.map(p => {
          const categorySlug = p.category?.slug || 'vegetables'
          const isMeat = categorySlug === 'meat'
          const meatType = p.name?.toLowerCase().includes('goat') ? 'goat' : 'chicken'

          return {
            ...p,
            // Category fields
            category_slug: categorySlug,
            category_emoji: p.category?.emoji || CATEGORY_EMOJI_MAP[categorySlug] || '🌿',
            // Market fields
            market_id: p.market?.id || null,
            market_name: p.market?.name || 'Orie Ntigha',
            market_location: p.market?.location || '',
            // Meat fields
            is_meat: isMeat,
            is_high_value: isMeat || p.price >= 2000000,
            meat_type: isMeat ? meatType : null,
          }
        })

        setProducts(mapped)
      }

      setProductsLoading(false)
    }

    fetchProducts()

    // Auto-refresh every 2 minutes on market days
    // so new agent uploads appear without page reload
    const refreshInterval = todayMarket || preorderOpen
      ? setInterval(fetchProducts, 2 * 60 * 1000)
      : null

    return () => {
      if (refreshInterval) clearInterval(refreshInterval)
    }
  }, [])

  // ============================================
  // GREYING LOGIC
  // Only grey out on actual market days
  // ============================================
  const productsWithAvailability = products.map(p => {
    if (!todayMarket) return { ...p, unavailable_today: false }
    if (orderingState === 'browse_only') return { ...p, unavailable_today: false }
    // On a live market day — grey out products from the other market
    const activeMarketName = todayMarket.name
    return {
      ...p,
      unavailable_today: p.market_name !== activeMarketName,
    }
  })

  // ============================================
  // FILTER AND SORT
  // ============================================
  const filtered = productsWithAvailability
    .filter(p =>
      activeCategory === 'all' || p.category_slug === activeCategory
    )
    .filter(p =>
      !search || p.name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      return 0
    })

  function handleAddMeat(productWithOptions) {
    addToCart(productWithOptions)
    toast.success(`${productWithOptions.name} added to basket`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 100 }}>

      {meatProduct && (
        <MeatOptionsModal
          product={meatProduct}
          orderType={orderingState === 'same_day' ? 'same_day' : 'preorder'}
          onClose={() => setMeatProduct(null)}
          onAdd={handleAddMeat}
        />
      )}

      <Navbar />
      <CountdownBanner />

      {/* Dynamic market header */}
      <div style={{ background: 'var(--green)', padding: '20px 16px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          {/* Status badge */}
          {orderingState === 'same_day' && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(116,198,157,0.2)', borderRadius: 20,
              padding: '4px 12px', marginBottom: 10,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#4ade80', display: 'inline-block',
              }} />
              <span style={{
                color: 'var(--green-muted)',
                fontSize: 11, fontWeight: 600, letterSpacing: 1,
              }}>
                LIVE • ORDERS CLOSE AT 10AM
              </span>
            </div>
          )}

          {orderingState === 'preorder' && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(212,160,23,0.2)', borderRadius: 20,
              padding: '4px 12px', marginBottom: 10,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--gold)', display: 'inline-block',
              }} />
              <span style={{
                color: 'var(--gold)',
                fontSize: 11, fontWeight: 600, letterSpacing: 1,
              }}>
                PRE-ORDER OPEN
              </span>
            </div>
          )}

          {orderingState === 'browse_only' && listingVisible && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.1)', borderRadius: 20,
              padding: '4px 12px', marginBottom: 10,
            }}>
              <Clock size={12} color="rgba(255,255,255,0.6)" />
              <span style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 11, fontWeight: 600, letterSpacing: 1,
              }}>
                BROWSING • PRE-ORDER OPENS 6PM
              </span>
            </div>
          )}

          {/* Market title */}
          {activeListingMarket ? (
            <div>
              <h1 style={{
                fontFamily: 'Playfair Display, serif',
                color: 'white', fontSize: 26, fontWeight: 900, marginBottom: 4,
              }}>
                {orderingState === 'same_day'
                  ? `Today's Market: ${activeListingMarket.name} is Live!`
                  : orderingState === 'preorder'
                  ? `Pre-order for Tomorrow: ${activeListingMarket.name}`
                  : `Coming Tomorrow: ${activeListingMarket.name}`}
              </h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                {activeListingMarket.location}
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                color: 'var(--green-muted)',
                fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 6,
              }}>
                🌙 BROWSING
              </div>
              <h1 style={{
                fontFamily: 'Playfair Display, serif',
                color: 'white', fontSize: 26, fontWeight: 900, marginBottom: 4,
              }}>
                {nextMarket.name}
              </h1>
              <div style={{ color: 'var(--gold)', fontSize: 13 }}>
                {formatMarketDate(nextDate)} — listings go live at 12PM the day before
              </div>
            </div>
          )}

          {/* Timing chips */}
          {orderingState !== 'browse_only' && (
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                orderingState === 'same_day'
                  ? { label: 'Orders close', value: '10:00 AM' }
                  : { label: 'Pre-order closes', value: '6:00 AM tomorrow' },
                { label: 'Umuahia pickup', value: '12:30 PM' },
                { label: 'Aba pickup', value: '3:00 PM' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '6px 12px',
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                    {label}
                  </div>
                  <div style={{
                    color: 'white',
                    fontFamily: 'DM Mono, monospace',
                    fontWeight: 600, fontSize: 13,
                  }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Market day greying notice */}
      {todayMarket && orderingState !== 'browse_only' && (
        <div style={{
          background: 'rgba(27,67,50,0.05)',
          padding: '8px 16px',
          borderBottom: '1px solid var(--cream-dark)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: '#888' }}>
            Showing {todayMarket.name} products today — other market items are greyed out
          </div>
        </div>
      )}

      {/* Browse only notice */}
      {!listingVisible && (
        <div style={{
          background: 'rgba(45,45,45,0.05)',
          padding: '10px 16px',
          borderBottom: '1px solid var(--cream-dark)',
        }}>
          <div style={{ fontSize: 13, color: '#666', textAlign: 'center' }}>
            👀 Browsing — listings for <strong>{nextMarket.name}</strong> go live at <strong>12PM the day before</strong>
          </div>
        </div>
      )}

      {/* Search + Sort */}
      <div style={{
        padding: '12px 16px',
        position: 'sticky', top: 56,
        background: 'var(--cream)', zIndex: 50,
        borderBottom: '1px solid var(--cream-dark)',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: '#888',
            }} />
            <input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                borderRadius: 8, border: '1.5px solid var(--cream-dark)',
                background: 'white', fontSize: 14, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '10px 12px', borderRadius: 8,
              border: '1.5px solid var(--cream-dark)',
              background: 'white', fontSize: 13,
              outline: 'none', color: 'var(--charcoal)',
            }}
          >
            <option value="default">Sort</option>
            <option value="price_asc">Cheapest first</option>
            <option value="price_desc">Most expensive</option>
          </select>
        </div>
      </div>

      {/* Category filter */}
      <div style={{
        overflowX: 'auto', padding: '12px 16px',
        display: 'flex', gap: 8, scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 20,
              border: '1.5px solid',
              borderColor: activeCategory === cat.slug
                ? 'var(--green)' : 'var(--cream-dark)',
              background: activeCategory === cat.slug
                ? 'var(--green)' : 'white',
              color: activeCategory === cat.slug
                ? 'white' : 'var(--charcoal)',
              fontSize: 13,
              fontWeight: activeCategory === cat.slug ? 600 : 400,
              whiteSpace: 'nowrap', cursor: 'pointer',
            }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Product count */}
      <div style={{ padding: '0 16px 12px', fontSize: 13, color: '#888' }}>
        {productsLoading
          ? 'Loading products...'
          : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
      </div>

      {/* Products grid — forced 2 columns */}
{productsLoading ? (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
    <p style={{ color: '#888', fontSize: 14 }}>
      Loading today's produce...
    </p>
  </div>
) : filtered.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
    <h3 style={{
      fontFamily: 'Playfair Display, serif',
      fontSize: 20, marginBottom: 8,
    }}>
      {activeCategory !== 'all'
        ? 'Nothing in this category yet'
        : products.length === 0
        ? 'No listings yet'
        : 'Nothing found'}
    </h3>
    <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
      {activeCategory !== 'all' && products.length > 0
        ? 'Try a different category.'
        : 'Listings go live at 12PM the day before market day.'}
    </p>
  </div>
) : (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    padding: '0 12px 20px',
    maxWidth: 700,
    margin: '0 auto',
  }}>
    {filtered.map(product => (
      <ProductCard
        key={product.id}
        product={product}
        unavailableToday={product.unavailable_today}
        orderingState={orderingState}
        onMeatOptionsClick={() => setMeatProduct(product)}
      />
    ))}
  </div>
)}

    </div>
  )
}
