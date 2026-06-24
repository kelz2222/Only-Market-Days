import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, Clock, ShoppingBasket } from 'lucide-react'
import Navbar from '../components/Navbar'
import CountdownBanner from '../components/CountdownBanner'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
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
    cutting: ['Whole (no cutting)', 'Cut in 2 halves', 'Cut in 4 pieces', 'Cut in 8 chunks', 'Chopped small for stew'],
    packaging: ['Standard nylon bag', 'Food-grade sealed bag (recommended)'],
  },
  goat: {
    cutting: ['Whole half (no cutting)', 'Cut in 4 large pieces', 'Cut in 8 pieces', 'Chopped small for pepper soup', 'Chopped small for stew'],
    packaging: ['Standard nylon bag', 'Food-grade sealed bag (recommended)'],
  },
}

const DEMO_PRODUCTS = [
  { id: '1', name: 'Fresh Ugu (Fluted Pumpkin)', category_slug: 'vegetables', category_emoji: '🌿', price: 80000, unit: 'bunch', quantity_available: 12, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, description: 'Freshly harvested this morning. Leaves stripped from stalk.', is_meat: false },
  { id: '3', name: 'Uziza Leaf', category_slug: 'vegetables', category_emoji: '🌿', price: 60000, unit: 'bunch', quantity_available: 15, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '4', name: 'Palm Oil (25 Litres)', category_slug: 'palm', category_emoji: '🫙', price: 4300000, unit: 'keg', quantity_available: 5, market_id: 'ntigha', market_name: 'Orie Ntigha', is_bulk: true, is_seasonal: false, description: 'Unrefined fresh palm oil. Pressed this week.', is_meat: false },
  { id: '6', name: 'Stockfish (Okporoko)', category_slug: 'protein', category_emoji: '🐟', price: 500000, unit: 'kg', quantity_available: 8, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '7', name: 'Crayfish', category_slug: 'protein', category_emoji: '🦐', price: 200000, unit: 'kg', quantity_available: 10, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '9', name: 'Yam (Medium Tuber)', category_slug: 'staples', category_emoji: '🌾', price: 150000, unit: 'tuber', quantity_available: 20, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '13', name: 'Bitterkola', category_slug: 'nuts', category_emoji: '🌰', price: 300000, unit: 'wrap', quantity_available: 5, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '15', name: 'Fresh Pepper (Mixed)', category_slug: 'spices', category_emoji: '🌶️', price: 150000, unit: 'kg', quantity_available: 12, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '2', name: 'Ukazi (Afang Leaf)', category_slug: 'vegetables', category_emoji: '🌿', price: 120000, unit: 'bunch', quantity_available: 7, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: false, is_meat: false },
  { id: '5', name: 'Palm Fruit (Rice Bag)', category_slug: 'palm', category_emoji: '🫙', price: 800000, unit: 'bag', quantity_available: 3, market_id: 'ukwu', market_name: 'Orie Ukwu', is_bulk: true, is_seasonal: false, is_meat: false },
  { id: '8', name: 'Dressed Chicken', category_slug: 'meat', category_emoji: '🐔', price: 700000, unit: 'piece', quantity_available: 6, market_id: 'ukwu', market_name: 'Orie Ukwu', is_preorder_only: true, is_seasonal: false, description: 'Processed fresh on market morning. Select your cutting style below.', is_meat: true, is_high_value: true, meat_type: 'chicken' },
  { id: '10', name: 'Garri (White)', category_slug: 'staples', category_emoji: '🌾', price: 250000, unit: 'mudu', quantity_available: 15, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: false, is_meat: false },
  { id: '11', name: 'Akpu / Fufu', category_slug: 'staples', category_emoji: '🌾', price: 180000, unit: 'wrap', quantity_available: 10, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: false, description: 'Fresh. Same-day collection recommended.', is_meat: false },
  { id: '12', name: 'Plantain (Ripe)', category_slug: 'fruits', category_emoji: '🍌', price: 120000, unit: 'bunch', quantity_available: 8, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: false, is_meat: false },
  { id: '14', name: 'Kolanut', category_slug: 'nuts', category_emoji: '🌰', price: 200000, unit: 'wrap', quantity_available: 9, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: false, is_meat: false },
  { id: '16', name: 'Fresh Corn (Roasting)', category_slug: 'grains', category_emoji: '🌽', price: 80000, unit: 'dozen', quantity_available: 20, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: true, season_note: '🌽 Peak season — cheapest it will be all year', is_meat: false },
  { id: '17', name: 'African Pear (Ube)', category_slug: 'seasonal', category_emoji: '🫐', price: 150000, unit: 'bunch', quantity_available: 0, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: true, season_note: 'Season: July–September', is_meat: false },
  { id: '18', name: 'Dressed Goat (Half)', category_slug: 'meat', category_emoji: '🐐', price: 2500000, unit: 'half', quantity_available: 2, market_id: 'ukwu', market_name: 'Orie Ukwu', is_preorder_only: true, is_bulk: true, is_seasonal: false, description: 'Processed fresh on market morning. Pre-order only. Select cutting style.', is_meat: true, is_high_value: true, meat_type: 'goat' },
]

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

// Meat options bottom drawer
function MeatOptionsModal({ product, orderType, onClose, onAdd }) {
  const options = MEAT_OPTIONS[product.meat_type] || MEAT_OPTIONS.chicken
  const [cutting, setCutting] = useState('')
  const [packaging, setPackaging] = useState('')

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, padding: '24px', maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.3s ease' }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700 }}>{product.name}</h2>
          <button onClick={onClose} style={{ background: 'var(--cream-dark)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>{product.description}</div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: orderType === 'preorder' ? 'rgba(212,160,23,0.1)' : 'rgba(27,67,50,0.08)',
          border: `1px solid ${orderType === 'preorder' ? 'var(--gold)' : 'var(--green-muted)'}`,
          borderRadius: 8, padding: '6px 12px', marginBottom: 20, fontSize: 12,
          color: orderType === 'preorder' ? '#8B6914' : 'var(--green)',
        }}>
          {orderType === 'preorder' ? '🌅 This is a pre-order — secured at 5AM tomorrow' : '🌿 Same-day order'}
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
                <input type="radio" name="cutting" value={opt} checked={cutting === opt} onChange={() => setCutting(opt)} style={{ accentColor: 'var(--green)', width: 16, height: 16 }} />
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
                <input type="radio" name="packaging" value={opt} checked={packaging === opt} onChange={() => setPackaging(opt)} style={{ accentColor: 'var(--green)', width: 16, height: 16 }} />
                <span style={{ fontSize: 14 }}>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '12px 0', borderTop: '1px solid var(--cream-dark)' }}>
          <span style={{ fontWeight: 600 }}>{product.name}</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{formatNaira(product.price)}</span>
        </div>

        <button
          onClick={() => {
            if (cutting && packaging) {
              onAdd({ ...product, cutting, packaging, notes: `Cut: ${cutting} | Pack: ${packaging}` })
              onClose()
            }
          }}
          disabled={!cutting || !packaging}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, opacity: (!cutting || !packaging) ? 0.5 : 1 }}
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

export default function Market() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState('default')
  const [meatProduct, setMeatProduct] = useState(null)
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

  // Grey out products from the OTHER market when a specific market is live
  const productsWithAvailability = DEMO_PRODUCTS.map(p => {
    if (!activeListingMarket) return { ...p, unavailable_today: false }
    return { ...p, unavailable_today: p.market_id !== activeListingMarket.id }
  })

  const filtered = productsWithAvailability
    .filter(p => activeCategory === 'all' || p.category_slug === activeCategory)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
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

          {/* State indicator dot */}
          {orderingState === 'same_day' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(116,198,157,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span style={{ color: 'var(--green-muted)', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>LIVE • ORDERS CLOSE AT 10AM</span>
            </div>
          )}

          {orderingState === 'preorder' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,160,23,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
              <span style={{ color: 'var(--gold)', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>
                PRE-ORDER OPEN • CLOSES {todayMarket ? '7AM TOMORROW' : '6AM TOMORROW'}
              </span>
            </div>
          )}

          {orderingState === 'browse_only' && listingVisible && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px', marginBottom: 10 }}>
              <Clock size={12} color="rgba(255,255,255,0.6)" />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>BROWSING • PRE-ORDER OPENS 6PM</span>
            </div>
          )}

          {activeListingMarket ? (
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
                {orderingState === 'same_day'
                  ? `Today's Market: ${activeListingMarket.name} is Live!`
                  : orderingState === 'preorder'
                  ? `Pre-order for ${tomorrowMarket ? 'Tomorrow' : 'Next'}: ${activeListingMarket.name}`
                  : `Coming Tomorrow: ${activeListingMarket.name}`
                }
              </h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                {activeListingMarket.location}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ color: 'var(--green-muted)', fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>🌙 BROWSING</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
                {nextMarket.name}
              </h1>
              <div style={{ color: 'var(--gold)', fontSize: 13 }}>
                {formatMarketDate(nextDate)} — listings go live at 12PM the day before
              </div>
            </div>
          )}

          {/* Order window info */}
          {orderingState !== 'browse_only' && (
            <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                orderingState === 'same_day'
                  ? { label: 'Orders close', value: '10:00 AM' }
                  : { label: 'Pre-order closes', value: todayMarket ? '7:00 AM' : '6:00 AM tomorrow' },
                { label: 'Umuahia pickup', value: '12:30 PM' },
                { label: 'Aba pickup', value: '3:00 PM' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{label}</div>
                  <div style={{ color: 'white', fontFamily: 'DM Mono, monospace', fontWeight: 600, fontSize: 13 }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products from other market notice */}
      {activeListingMarket && (
        <div style={{ background: 'rgba(27,67,50,0.05)', padding: '8px 16px', borderBottom: '1px solid var(--cream-dark)', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#888' }}>
            Greyed out items are from the other market — available on their own market day
          </div>
        </div>
      )}

      {/* Browse-only notice when no listings yet */}
      {!listingVisible && (
        <div style={{ background: 'rgba(45,45,45,0.05)', padding: '12px 16px', borderBottom: '1px solid var(--cream-dark)' }}>
          <div style={{ fontSize: 13, color: '#666', textAlign: 'center' }}>
            👀 Browsing the catalogue — listings for <strong>{nextMarket.name}</strong> go live at <strong>12PM on {formatMarketDate(new Date(nextDate.getTime() - 86400000))}</strong>
          </div>
        </div>
      )}

      {/* Search + Sort */}
      <div style={{ padding: '12px 16px', position: 'sticky', top: 56, background: 'var(--cream)', zIndex: 50, borderBottom: '1px solid var(--cream-dark)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'white', fontSize: 14, outline: 'none' }}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'white', fontSize: 13, outline: 'none', color: 'var(--charcoal)' }}
          >
            <option value="default">Sort</option>
            <option value="price_asc">Cheapest first</option>
            <option value="price_desc">Most expensive</option>
          </select>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ overflowX: 'auto', padding: '12px 16px', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20,
              border: '1.5px solid', borderColor: activeCategory === cat.slug ? 'var(--green)' : 'var(--cream-dark)',
              background: activeCategory === cat.slug ? 'var(--green)' : 'white',
              color: activeCategory === cat.slug ? 'white' : 'var(--charcoal)',
              fontSize: 13, fontWeight: activeCategory === cat.slug ? 600 : 400, whiteSpace: 'nowrap', cursor: 'pointer',
            }}
          >
            <span>{cat.emoji}</span><span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px 12px', fontSize: 13, color: '#888' }}>
        {filtered.length} product{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Products grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, padding: '0 16px', maxWidth: 700, margin: '0 auto' }}>
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

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, marginBottom: 8 }}>Nothing found</h3>
          <p style={{ color: '#888', fontSize: 14 }}>Try a different category or search term.</p>
        </div>
      )}
    </div>
  )
}
