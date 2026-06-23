import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import CountdownBanner from '../components/CountdownBanner'
import ProductCard from '../components/ProductCard'
import { getTodaysMarket, getNextMarket, formatMarketDate, isOrderOpen, isPreorderOpen } from '../lib/marketCalendar'

const DEMO_PRODUCTS = [
  { id: '1', name: 'Fresh Ugu (Fluted Pumpkin)', category_slug: 'vegetables', category_emoji: '🌿', price: 80000, unit: 'bunch', quantity_available: 12, market_name: 'Orie Ntigha', is_seasonal: false, description: 'Freshly harvested this morning. Leaves stripped from stalk.' },
  { id: '2', name: 'Ukazi (Afang Leaf)', category_slug: 'vegetables', category_emoji: '🌿', price: 120000, unit: 'bunch', quantity_available: 7, market_name: 'Orie Ukwu', is_seasonal: false },
  { id: '3', name: 'Uziza Leaf', category_slug: 'vegetables', category_emoji: '🌿', price: 60000, unit: 'bunch', quantity_available: 15, market_name: 'Orie Ntigha', is_seasonal: false },
  { id: '4', name: 'Palm Oil (25 Litres)', category_slug: 'palm', category_emoji: '🫙', price: 4300000, unit: 'keg', quantity_available: 5, market_name: 'Orie Ntigha', is_bulk: true, is_seasonal: false, description: 'Unrefined fresh palm oil. Pressed this week.' },
  { id: '5', name: 'Palm Fruit (Rice Bag)', category_slug: 'palm', category_emoji: '🫙', price: 800000, unit: 'bag', quantity_available: 3, market_name: 'Orie Ukwu', is_bulk: true, is_seasonal: false },
  { id: '6', name: 'Stockfish (Okporoko)', category_slug: 'protein', category_emoji: '🐟', price: 500000, unit: 'kg', quantity_available: 8, market_name: 'Orie Ntigha', is_seasonal: false },
  { id: '7', name: 'Crayfish', category_slug: 'protein', category_emoji: '🐟', price: 200000, unit: 'kg', quantity_available: 10, market_name: 'Orie Ntigha', is_seasonal: false },
  { id: '8', name: 'Dressed Chicken', category_slug: 'meat', category_emoji: '🐔', price: 700000, unit: 'piece', quantity_available: 6, market_name: 'Orie Ukwu', is_preorder_only: true, is_seasonal: false, description: 'Pre-order only. Slaughtered and cleaned fresh on market morning.' },
  { id: '9', name: 'Yam (Medium Tuber)', category_slug: 'staples', category_emoji: '🌾', price: 150000, unit: 'tuber', quantity_available: 20, market_name: 'Orie Ntigha', is_seasonal: false },
  { id: '10', name: 'Garri (White)', category_slug: 'staples', category_emoji: '🌾', price: 250000, unit: 'mudu', quantity_available: 15, market_name: 'Orie Ukwu', is_seasonal: false },
  { id: '11', name: 'Akpu / Fufu', category_slug: 'staples', category_emoji: '🌾', price: 180000, unit: 'wrap', quantity_available: 10, market_name: 'Orie Ntigha', is_seasonal: false, description: 'Fresh. Same-day collection recommended.' },
  { id: '12', name: 'Plantain (Ripe)', category_slug: 'fruits', category_emoji: '🍌', price: 120000, unit: 'bunch', quantity_available: 8, market_name: 'Orie Ukwu', is_seasonal: false },
  { id: '13', name: 'Bitterkola', category_slug: 'nuts', category_emoji: '🌰', price: 300000, unit: 'wrap', quantity_available: 5, market_name: 'Orie Ntigha', is_seasonal: false },
  { id: '14', name: 'Kolanut', category_slug: 'nuts', category_emoji: '🌰', price: 200000, unit: 'wrap', quantity_available: 9, market_name: 'Orie Ukwu', is_seasonal: false },
  { id: '15', name: 'Fresh Pepper (Mixed)', category_slug: 'spices', category_emoji: '🌶️', price: 150000, unit: 'kg', quantity_available: 12, market_name: 'Orie Ntigha', is_seasonal: false },
  { id: '16', name: 'Fresh Corn (Roasting)', category_slug: 'grains', category_emoji: '🌽', price: 80000, unit: 'dozen', quantity_available: 20, market_name: 'Orie Ukwu', is_seasonal: true, season_note: '🌽 Peak season — cheapest it will be all year' },
  { id: '17', name: 'African Pear (Ube)', category_slug: 'seasonal', category_emoji: '🫐', price: 150000, unit: 'bunch', quantity_available: 0, market_name: 'Orie Ntigha', is_seasonal: true, season_note: 'Season: July–September' },
  { id: '18', name: 'Dressed Goat (Half)', category_slug: 'meat', category_emoji: '🐔', price: 2500000, unit: 'half', quantity_available: 2, market_name: 'Orie Ukwu', is_preorder_only: true, is_bulk: true, is_seasonal: false },
]

const CATEGORIES = [
  { slug: 'all', name: 'All', emoji: '🛒' },
  { slug: 'vegetables', name: 'Vegetables', emoji: '🌿' },
  { slug: 'staples', name: 'Staples', emoji: '🌾' },
  { slug: 'palm', name: 'Palm', emoji: '🫙' },
  { slug: 'protein', name: 'Protein', emoji: '🐟' },
  { slug: 'meat', name: 'Meat', emoji: '🐔' },
  { slug: 'spices', name: 'Spices', emoji: '🌶️' },
  { slug: 'fruits', name: 'Fruits', emoji: '🍌' },
  { slug: 'seasonal', name: 'Seasonal', emoji: '🍊' },
  { slug: 'nuts', name: 'Nuts', emoji: '🌰' },
  { slug: 'grains', name: 'Grains', emoji: '🌽' },
]

export default function Market() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState('default')

  const now = new Date()
  const todayMarket = getTodaysMarket(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)

  const filtered = DEMO_PRODUCTS
    .filter(p => activeCategory === 'all' || p.category_slug === activeCategory)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      return 0
    })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 100 }}>
      <Navbar />
      <CountdownBanner />

      <div style={{ background: 'var(--green)', padding: '20px 16px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {todayMarket ? (
            <div>
              <div style={{ color: 'var(--green-muted)', fontSize: 11, fontWeight: 600, letterSpacing: 2 }}>🌿 TODAY'S MARKET</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 28, fontWeight: 900, marginTop: 4 }}>{todayMarket.name}</h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{todayMarket.location}</div>
              {!orderOpen && <div style={{ marginTop: 10, color: 'var(--gold)', fontSize: 13 }}>⚠️ Orders closed for today. Browsing for next market day.</div>}
            </div>
          ) : preorderOpen ? (
            <div>
              <div style={{ color: 'var(--gold)', fontSize: 11, fontWeight: 600, letterSpacing: 2 }}>🌅 PRE-ORDER OPEN</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 28, fontWeight: 900, marginTop: 4 }}>Order for Tomorrow</h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Pre-orders get first pick at 5AM. Closes 10PM tonight.</div>
            </div>
          ) : (
            <div>
              <div style={{ color: 'var(--green-muted)', fontSize: 11, fontWeight: 600, letterSpacing: 2 }}>🌙 BROWSING</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 28, fontWeight: 900, marginTop: 4 }}>{nextMarket.name}</h1>
              <div style={{ color: 'var(--gold)', fontSize: 13 }}>{formatMarketDate(nextDate)} — orders open at 7AM</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px', position: 'sticky', top: 64, background: 'var(--cream)', zIndex: 50, borderBottom: '1px solid var(--cream-dark)' }}>
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

      <div style={{ overflowX: 'auto', padding: '12px 16px', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, border: '1.5px solid', borderColor: activeCategory === cat.slug ? 'var(--green)' : 'var(--cream-dark)', background: activeCategory === cat.slug ? 'var(--green)' : 'white', color: activeCategory === cat.slug ? 'white' : 'var(--charcoal)', fontSize: 13, fontWeight: activeCategory === cat.slug ? 600 : 400, whiteSpace: 'nowrap', cursor: 'pointer' }}>
            <span>{cat.emoji}</span><span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px 12px', fontSize: 13, color: '#888' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, padding: '0 16px', maxWidth: 700, margin: '0 auto' }}>
        {filtered.map(product => <ProductCard key={product.id} product={product} />)}
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
