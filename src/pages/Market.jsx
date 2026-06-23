import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import CountdownBanner from '../components/CountdownBanner'
import ProductCard from '../components/ProductCard'
import { getTodaysMarket, getNextMarket, formatMarketDate, isOrderOpen, isPreorderOpen } from '../lib/marketCalendar'

const MEAT_CATEGORIES = ['meat']

const DEMO_PRODUCTS = [
  // Orie Ntigha products
  { id: '1', name: 'Fresh Ugu (Fluted Pumpkin)', category_slug: 'vegetables', category_emoji: '🌿', price: 80000, unit: 'bunch', quantity_available: 12, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, description: 'Freshly harvested this morning. Leaves stripped from stalk.', is_meat: false },
  { id: '3', name: 'Uziza Leaf', category_slug: 'vegetables', category_emoji: '🌿', price: 60000, unit: 'bunch', quantity_available: 15, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '4', name: 'Palm Oil (25 Litres)', category_slug: 'palm', category_emoji: '🫙', price: 4300000, unit: 'keg', quantity_available: 5, market_id: 'ntigha', market_name: 'Orie Ntigha', is_bulk: true, is_seasonal: false, description: 'Unrefined fresh palm oil. Pressed this week.', is_meat: false },
  { id: '6', name: 'Stockfish (Okporoko)', category_slug: 'protein', category_emoji: '🐟', price: 500000, unit: 'kg', quantity_available: 8, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '7', name: 'Crayfish', category_slug: 'protein', category_emoji: '🦐', price: 200000, unit: 'kg', quantity_available: 10, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '9', name: 'Yam (Medium Tuber)', category_slug: 'staples', category_emoji: '🌾', price: 150000, unit: 'tuber', quantity_available: 20, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '13', name: 'Bitterkola', category_slug: 'nuts', category_emoji: '🌰', price: 300000, unit: 'wrap', quantity_available: 5, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },
  { id: '15', name: 'Fresh Pepper (Mixed)', category_slug: 'spices', category_emoji: '🌶️', price: 150000, unit: 'kg', quantity_available: 12, market_id: 'ntigha', market_name: 'Orie Ntigha', is_seasonal: false, is_meat: false },

  // Orie Ukwu products
  { id: '2', name: 'Ukazi (Afang Leaf)', category_slug: 'vegetables', category_emoji: '🌿', price: 120000, unit: 'bunch', quantity_available: 7, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: false, is_meat: false },
  { id: '5', name: 'Palm Fruit (Rice Bag)', category_slug: 'palm', category_emoji: '🫙', price: 800000, unit: 'bag', quantity_available: 3, market_id: 'ukwu', market_name: 'Orie Ukwu', is_bulk: true, is_seasonal: false, is_meat: false },
  { id: '8', name: 'Dressed Chicken', category_slug: 'meat', category_emoji: '🐔', price: 700000, unit: 'piece', quantity_available: 6, market_id: 'ukwu', market_name: 'Orie Ukwu', is_preorder_only: true, is_seasonal: false, description: 'Processed fresh this morning. Pre-order only.', is_meat: true, is_high_value: false },
  { id: '10', name: 'Garri (White)', category_slug: 'staples', category_emoji: '🌾', price: 250000, unit: 'mudu', quantity_available: 15, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: false, is_meat: false },
  { id: '11', name: 'Akpu / Fufu', category_slug: 'staples', category_emoji: '🌾', price: 180000, unit: 'wrap', quantity_available: 10, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: false, description: 'Fresh. Same-day collection recommended.', is_meat: false },
  { id: '12', name: 'Plantain (Ripe)', category_slug: 'fruits', category_emoji: '🍌', price: 120000, unit: 'bunch', quantity_available: 8, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: false, is_meat: false },
  { id: '14', name: 'Kolanut', category_slug: 'nuts', category_emoji: '🌰', price: 200000, unit: 'wrap', quantity_available: 9, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: false, is_meat: false },
  { id: '16', name: 'Fresh Corn (Roasting)', category_slug: 'grains', category_emoji: '🌽', price: 80000, unit: 'dozen', quantity_available: 20, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: true, season_note: '🌽 Peak season — cheapest it will be all year', is_meat: false },
  { id: '17', name: 'African Pear (Ube)', category_slug: 'seasonal', category_emoji: '🫐', price: 150000, unit: 'bunch', quantity_available: 0, market_id: 'ukwu', market_name: 'Orie Ukwu', is_seasonal: true, season_note: 'Season: July–September', is_meat: false },
  { id: '18', name: 'Dressed Goat (Half)', category_slug: 'meat', category_emoji: '🐐', price: 2500000, unit: 'half', quantity_available: 2, market_id: 'ukwu', market_name: 'Orie Ukwu', is_preorder_only: true, is_bulk: true, is_seasonal: false, description: 'Processed fresh on market morning. Pre-order only. Select cutting style before adding.', is_meat: true, is_high_value: true },
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

// High value item modal
function HighValueModal({ product, onClose, onAdd }) {
  const [cutting, setCutting] = useState('')
  const [packaging, setPackaging] = useState('')

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, padding: '24px', animation: 'slideUp 0.3s ease' }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{product.name}</h2>
            <div style={{ fontSize: 13, color: '#666' }}>{product.description}</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--cream-dark)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Cutting Style</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Whole (no cutting)', 'Cut in 4 pieces', 'Cut in 8 pieces', 'Chopped small'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: `2px solid ${cutting === opt ? 'var(--green)' : 'var(--cream-dark)'}`, borderRadius: 10, cursor: 'pointer', background: cutting === opt ? 'rgba(27,67,50,0.04)' : 'white' }}>
                <input type="radio" name="cutting" value={opt} checked={cutting === opt} onChange={() => setCutting(opt)} style={{ accentColor: 'var(--green)' }} />
                <span style={{ fontSize: 14 }}>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Packaging</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Standard nylon bag', 'Food-grade sealed bag (recommended)'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: `2px solid ${packaging === opt ? 'var(--green)' : 'var(--cream-dark)'}`, borderRadius: 10, cursor: 'pointer', background: packaging === opt ? 'rgba(27,67,50,0.04)' : 'white' }}>
                <input type="radio" name="packaging" value={opt} checked={packaging === opt} onChange={() => setPackaging(opt)} style={{ accentColor: 'var(--green)' }} />
                <span style={{ fontSize: 14 }}>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => { if (cutting && packaging) { onAdd({ ...product, cutting, packaging }); onClose() } }}
          disabled={!cutting || !packaging}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, opacity: (!cutting || !packaging) ? 0.5 : 1 }}
        >
          Add to Basket
        </button>
        {(!cutting || !packaging) && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 8 }}>Please select cutting style and packaging to continue</p>
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
  const [highValueProduct, setHighValueProduct] = useState(null)

  const now = new Date()
  const todayMarket = getTodaysMarket(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)

  // Filter products based on active market
  // If a market is open today, grey out products from the other market
  const productsWithAvailability = DEMO_PRODUCTS.map(p => {
    if (!todayMarket) return { ...p, unavailable_today: false }
    const isOtherMarket = p.market_id !== todayMarket.id
    return { ...p, unavailable_today: isOtherMarket }
  })

  const filtered = productsWithAvailability
    .filter(p => activeCategory === 'all' || p.category_slug === activeCategory)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      return 0
    })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 100 }}>
      {highValueProduct && (
        <HighValueModal
          product={highValueProduct}
          onClose={() => setHighValueProduct(null)}
          onAdd={(product) => {
            // Import useCart at top and call addToCart here
            setHighValueProduct(null)
          }}
        />
      )}

      <Navbar />
      <CountdownBanner />

      {/* Dynamic market header */}
      <div style={{ background: 'var(--green)', padding: '20px 16px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {todayMarket ? (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(116,198,157,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ color: 'var(--green-muted)', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>LIVE TODAY</span>
              </div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
                Today's Market: {todayMarket.name} is Live!
              </h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{todayMarket.location}</div>
              {!orderOpen && (
                <div style={{ marginTop: 10, background: 'rgba(212,160,23,0.15)', borderRadius: 8, padding: '8px 12px', color: 'var(--gold)', fontSize: 13 }}>
                  ⚠️ Same-day orders are closed. You can still pre-order for the next market day.
                </div>
              )}
            </div>
          ) : preorderOpen ? (
            <div>
              <div style={{ color: 'var(--gold)', fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>🌅 PRE-ORDER WINDOW OPEN</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
                Order for Tomorrow's Market
              </h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Pre-orders get first pick at 5AM. Closes at 10PM tonight.</div>
            </div>
          ) : (
            <div>
              <div style={{ color: 'var(--green-muted)', fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>🌙 BROWSING MODE</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
                {nextMarket.name}
              </h1>
              <div style={{ color: 'var(--gold)', fontSize: 13 }}>{formatMarketDate(nextDate)} — pre-order opens at 6PM the evening before</div>
            </div>
          )}
        </div>
      </div>

      {/* Other market notice */}
      {todayMarket && (
        <div style={{ background: 'rgba(27,67,50,0.06)', padding: '10px 16px', borderBottom: '1px solid var(--cream-dark)' }}>
          <div style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
            Showing all products — items from the other market are greyed out and unavailable today
          </div>
        </div>
      )}

      {/* Search + Sort */}
      <div style={{ padding: '12px 16px', position: 'sticky', top: 56, background: 'var(--cream)', zIndex: 50, borderBottom: '1px solid var(--cream-dark)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'white', fontSize: 14, outline: 'none' }} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'white', fontSize: 13, outline: 'none', color: 'var(--charcoal)' }}>
            <option value="default">Sort</option>
            <option value="price_asc">Cheapest first</option>
            <option value="price_desc">Most expensive</option>
          </select>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ overflowX: 'auto', padding: '12px 16px', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20,
            border: '1.5px solid', borderColor: activeCategory === cat.slug ? 'var(--green)' : 'var(--cream-dark)',
            background: activeCategory === cat.slug ? 'var(--green)' : 'white',
            color: activeCategory === cat.slug ? 'white' : 'var(--charcoal)',
            fontSize: 13, fontWeight: activeCategory === cat.slug ? 600 : 400, whiteSpace: 'nowrap', cursor: 'pointer',
          }}>
            <span>{cat.emoji}</span><span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px 12px', fontSize: 13, color: '#888' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</div>

      {/* Products grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, padding: '0 16px', maxWidth: 700, margin: '0 auto' }}>
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            unavailableToday={product.unavailable_today}
            onHighValueClick={() => setHighValueProduct(product)}
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
