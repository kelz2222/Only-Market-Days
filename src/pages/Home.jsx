import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBasket, Bell, TrendingDown, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import CountdownBanner from '../components/CountdownBanner'
import MarketDayPopup from '../components/MarketDayPopup'
import { getTodaysMarket, getNextMarket, formatMarketDate, isOrderOpen, isPreorderOpen, getSeasonLabel } from '../lib/marketCalendar'

const CATEGORIES = [
  { emoji: '🌿', name: 'Vegetables', slug: 'vegetables' },
  { emoji: '🌾', name: 'Staples', slug: 'staples' },
  { emoji: '🫙', name: 'Palm Produce', slug: 'palm' },
  { emoji: '🐟', name: 'Dried Protein', slug: 'protein' },
  { emoji: '🐔', name: 'Dressed Meat', slug: 'meat' },
  { emoji: '🌶️', name: 'Spices', slug: 'spices' },
  { emoji: '🍌', name: 'Fruits', slug: 'fruits' },
  { emoji: '🍊', name: 'Seasonal', slug: 'seasonal' },
  { emoji: '🌰', name: 'Nuts & Kola', slug: 'nuts' },
  { emoji: '🌽', name: 'Grains', slug: 'grains' },
]

const SEASONAL_INTEL = [
  { name: 'African Pear (Ube)', emoji: '🫐', months: [7,8,9], villagePrice: '₦1,500/bunch', cityPrice: '₦3,500/bunch', save: '₦2,000' },
  { name: 'Fresh Corn', emoji: '🌽', months: [5,6,7,8], villagePrice: '₦800/dozen', cityPrice: '₦1,800/dozen', save: '₦1,000' },
  { name: 'Palm Oil (25L)', emoji: '🫙', months: [1,2,3,4,5,6,7,8,9,10,11,12], villagePrice: '₦43,000/keg', cityPrice: '₦55,000+/keg', save: '₦12,000+' },
]

export default function Home() {
  const [showPopup, setShowPopup] = useState(false)
  const now = new Date()
  const todayMarket = getTodaysMarket(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)
  const currentMonth = now.getMonth() + 1

  useEffect(() => {
    const seen = sessionStorage.getItem('popup_seen')
    if (!seen) {
      setTimeout(() => setShowPopup(true), 800)
      sessionStorage.setItem('popup_seen', '1')
    }
  }, [])

  const currentSeasonal = SEASONAL_INTEL.filter(i => i.months.includes(currentMonth))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 80 }}>
      {showPopup && <MarketDayPopup onClose={() => setShowPopup(false)} />}
      <Navbar />
      <CountdownBanner />

      <div style={{ background: 'linear-gradient(160deg, var(--green) 0%, var(--green-light) 60%, #40916C 100%)', padding: '48px 24px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ color: 'var(--green-muted)', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>ISIALA NGWA NORTH • ABIA STATE</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 'clamp(32px, 8vw, 52px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
            Fresh from the<br /><span style={{ color: 'var(--gold)' }}>village.</span><br />Only on market days.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.6, marginBottom: 28, maxWidth: 380 }}>
            Direct from Orie Ntigha and Orie Ukwu markets to Aba and Umuahia. No middleman. No markup. Just fresh.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(orderOpen || preorderOpen) ? (
              <Link to="/market" className="btn-primary" style={{ fontSize: 16, padding: '14px 28px' }}>
                <ShoppingBasket size={20} />{preorderOpen && !orderOpen ? 'Pre-order Now' : 'Shop Market'}
              </Link>
            ) : (
              <button className="btn-primary" style={{ fontSize: 16, padding: '14px 28px' }} onClick={() => setShowPopup(true)}>
                <Bell size={20} />Next Market: {nextMarket.name}
              </button>
            )}
            <Link to="/market" className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: 15 }}>Browse Products</Link>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
            {[{ icon: '🌿', text: 'Farm fresh' }, { icon: '🚐', text: 'Aba & Umuahia delivery' }, { icon: '📦', text: 'Food grade packaging' }].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {todayMarket && (
        <div style={{ padding: '0 16px', marginTop: -20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-lg)', borderLeft: '4px solid var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, marginBottom: 4 }}>🌿 OPEN TODAY</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700 }}>{todayMarket.name}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{todayMarket.location}</div>
            </div>
            <Link to="/market" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '12px 20px' }}>Shop Now <ArrowRight size={16} /></Link>
          </div>
        </div>
      )}

      <div style={{ padding: '36px 16px 0' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>What we carry</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} to={`/market?category=${cat.slug}`} style={{ background: 'white', borderRadius: 12, padding: '16px 8px', textAlign: 'center', boxShadow: 'var(--shadow)', display: 'block' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--charcoal)' }}>{cat.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {currentSeasonal.length > 0 && (
        <div style={{ padding: '36px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <TrendingDown size={20} color="var(--gold)" />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700 }}>What's cheaper now</h2>
          </div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>{getSeasonLabel()} — buy direct and save vs Aba market prices</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentSeasonal.map(item => (
              <div key={item.name} style={{ background: 'white', borderRadius: 12, padding: '16px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 32 }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <div><div style={{ color: '#888' }}>Village price</div><div style={{ color: 'var(--green)', fontWeight: 700 }}>{item.villagePrice}</div></div>
                    <div><div style={{ color: '#888' }}>City price</div><div style={{ color: '#999', textDecoration: 'line-through' }}>{item.cityPrice}</div></div>
                  </div>
                </div>
                <div style={{ background: 'rgba(27,67,50,0.08)', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#888' }}>You save</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>{item.save}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '36px 16px 0' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>How it works</h2>
        {[
          { step: '01', title: 'Order before 10AM', desc: 'Browse and order on market morning. Or pre-order the night before for guaranteed first pick.', icon: '📱' },
          { step: '02', title: 'We shop for you', desc: 'Our market agent buys your items fresh from the sellers at Orie Ntigha or Orie Ukwu.', icon: '🛒' },
          { step: '03', title: 'Packaged clean', desc: 'Every item is sorted, prepped and packed in food-grade transparent bags.', icon: '📦' },
          { step: '04', title: 'Collect in your city', desc: 'Pick up in Aba from 3PM or Umuahia from 12:30PM. Or pay a keke for door delivery.', icon: '🚐' },
        ].map(({ step, title, desc, icon }, i) => (
          <div key={step} style={{ display: 'flex', gap: 16, position: 'relative' }}>
            {i < 3 && <div style={{ position: 'absolute', left: 20, top: 52, bottom: 0, width: 2, background: 'linear-gradient(to bottom, var(--green-muted), transparent)' }} />}
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, zIndex: 1 }}>{icon}</div>
            <div style={{ paddingBottom: 28 }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--green)', marginBottom: 4 }}>{step}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '36px 16px 0' }}>
        <div style={{ background: 'var(--green)', borderRadius: 16, padding: '24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--green-muted)', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>COMING UP</div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{nextMarket.name}</h3>
          <div style={{ color: 'var(--gold)', fontSize: 14, marginBottom: 20 }}>{formatMarketDate(nextDate)}</div>
          <button className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', margin: '0 auto', display: 'flex' }}>
            <Bell size={16} />Notify me the evening before
          </button>
        </div>
      </div>
    </div>
  )
}
