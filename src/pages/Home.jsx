import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBasket, Bell, TrendingDown, ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import CountdownBanner from '../components/CountdownBanner'
import MarketDayPopup from '../components/MarketDayPopup'
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
  getSeasonLabel,
  TIMING,
} from '../lib/marketCalendar'

// ============================================
// MARKET SLIDES
// Replace image_url values with real photos
// from Orie Ntigha when you have them
// ============================================
const MARKET_SLIDES = [
  {
    id: 1,
    image_url: null,
    bg: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
    emoji: '🌿',
    label: 'Orie Ntigha Market',
    caption: 'Fresh leafy vegetables — harvested at dawn',
    accent: '#74C69D',
  },
  {
    id: 2,
    image_url: null,
    bg: 'linear-gradient(135deg, #7B3F00 0%, #C0522B 60%, #E8793A 100%)',
    emoji: '🫙',
    label: 'Fresh Palm Oil',
    caption: 'Unrefined village palm oil — pressed this week',
    accent: '#F7B731',
  },
  {
    id: 3,
    image_url: null,
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    emoji: '🐟',
    label: 'Stockfish & Crayfish',
    caption: 'Dried protein — sorted and ready to cook',
    accent: '#74b9ff',
  },
  {
    id: 4,
    image_url: null,
    bg: 'linear-gradient(135deg, #2D5016 0%, #4a7c1f 50%, #6db33f 100%)',
    emoji: '🌽',
    label: 'Seasonal Produce',
    caption: 'What is in season is cheapest today',
    accent: '#F7B731',
  },
  {
    id: 5,
    image_url: null,
    bg: 'linear-gradient(135deg, #3d1515 0%, #7B2D2D 50%, #C0522B 100%)',
    emoji: '🐔',
    label: 'Dressed Meat',
    caption: 'Processed fresh on market morning',
    accent: '#FFD460',
  },
  {
    id: 6,
    image_url: null,
    bg: 'linear-gradient(135deg, #1B4332 0%, #9B7E46 100%)',
    emoji: '🌰',
    label: 'Bitterkola & Kolanut',
    caption: 'Fresh village nuts — sorted, no damaged ones',
    accent: '#D4A017',
  },
]

// ============================================
// MARKET SLIDESHOW COMPONENT
// ============================================
function MarketSlideshow() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef(null)

  function goTo(index) {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrent(index)
      setIsTransitioning(false)
    }, 300)
  }

  function next() {
    goTo((current + 1) % MARKET_SLIDES.length)
  }

  function prev() {
    goTo((current - 1 + MARKET_SLIDES.length) % MARKET_SLIDES.length)
  }

  // Auto-advance every 4 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % MARKET_SLIDES.length)
    }, 4000)
    return () => clearInterval(intervalRef.current)
  }, [])

  // Reset timer on manual navigation
  function handleManualNav(fn) {
    clearInterval(intervalRef.current)
    fn()
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % MARKET_SLIDES.length)
    }, 4000)
  }

  const slide = MARKET_SLIDES[current]

  return (
    <div style={{
      position: 'relative',
      height: 260,
      overflow: 'hidden',
      background: slide.bg,
    }}>
      {/* Slide content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: slide.image_url
          ? `url(${slide.image_url}) center/cover`
          : slide.bg,
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        {/* Dark overlay for text readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.25)',
        }} />

        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: -30, right: -30,
          width: 160, height: 160,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -40, left: -20,
          width: 180, height: 180,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        {/* Slide text */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 10, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
            {slide.emoji}
          </div>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            color: 'white',
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 6,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>
            {slide.label}
          </div>
          <div style={{
            color: slide.accent,
            fontSize: 13,
            fontWeight: 500,
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            maxWidth: 260,
            lineHeight: 1.4,
          }}>
            {slide.caption}
          </div>
        </div>
      </div>

      {/* Prev button */}
      <button
        onClick={() => handleManualNav(prev)}
        style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.3)',
          border: 'none', borderRadius: '50%',
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.2s',
          zIndex: 10,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
      >
        <ChevronLeft size={18} />
      </button>

      {/* Next button */}
      <button
        onClick={() => handleManualNav(next)}
        style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.3)',
          border: 'none', borderRadius: '50%',
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.2s',
          zIndex: 10,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div style={{
        position: 'absolute',
        bottom: 12, left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        zIndex: 10,
      }}>
        {MARKET_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleManualNav(() => goTo(i))}
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Market label badge top left */}
      <div style={{
        position: 'absolute',
        top: 14, left: 14,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
        borderRadius: 20,
        padding: '4px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#4ade80',
        }} />
        <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>
          Isiala Ngwa North
        </span>
      </div>
    </div>
  )
}

// ============================================
// CATEGORIES
// ============================================
const CATEGORIES = [
  { emoji: '🌿', name: 'Vegetables', slug: 'vegetables' },
  { emoji: '🌾', name: 'Staples', slug: 'staples' },
  { emoji: '🫙', name: 'Palm Produce', slug: 'palm' },
  { emoji: '🦐', name: 'Dried Protein', slug: 'protein' },
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

// ============================================
// HOME PAGE
// ============================================
export default function Home() {
  const [showPopup, setShowPopup] = useState(false)
  const now = new Date()
  const todayMarket = getTodaysMarket(now)
  const tomorrowMarket = getTomorrowsMarket(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)
  const listingVisible = isListingVisible(now)
  const orderingState = getOrderingState(now)
  const currentMonth = now.getMonth() + 1
  const currentHour = now.getHours()

  useEffect(() => {
    const seen = sessionStorage.getItem('popup_seen')
    if (!seen) {
      setTimeout(() => setShowPopup(true), 800)
      sessionStorage.setItem('popup_seen', '1')
    }
  }, [])

  const currentSeasonal = SEASONAL_INTEL.filter(i => i.months.includes(currentMonth))

  function getHeroCTA() {
    if (orderingState === 'same_day') return { label: 'Shop Market Now', icon: <ShoppingBasket size={20} /> }
    if (orderingState === 'preorder') return { label: 'Pre-order Now', icon: <ShoppingBasket size={20} /> }
    return { label: `Next Market: ${nextMarket.name}`, icon: <Bell size={20} /> }
  }

  const heroCTA = getHeroCTA()

  function getHeroSubtitle() {
    if (todayMarket && orderOpen) return `${todayMarket.name.toUpperCase()} IS LIVE TODAY`
    if (todayMarket && !orderOpen) return `${todayMarket.name.toUpperCase()} • ORDERS CLOSED`
    if (preorderOpen && tomorrowMarket) return `PRE-ORDER OPEN • ${tomorrowMarket.name.toUpperCase()} TOMORROW`
    if (listingVisible && tomorrowMarket) return `LISTINGS LIVE • ${tomorrowMarket.name.toUpperCase()} TOMORROW`
    return `NEXT: ${nextMarket.name.toUpperCase()} — ${formatMarketDate(nextDate).toUpperCase()}`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 80 }}>
      {showPopup && <MarketDayPopup onClose={() => setShowPopup(false)} />}
      <Navbar />
      <CountdownBanner />

      {/* Pre-order banner */}
      {preorderOpen && tomorrowMarket && !orderOpen && (
        <div style={{
          background: 'linear-gradient(90deg, #2D6A4F, var(--green))',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ color: 'var(--gold)', fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>
              🌅 PRE-ORDER NOW OPEN
            </div>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>
              {tomorrowMarket.name} is tomorrow — order tonight, picked fresh at 5AM
            </div>
          </div>
          <Link to="/market" style={{
            background: 'var(--orange)', color: 'white',
            borderRadius: 8, padding: '8px 16px',
            fontSize: 13, fontWeight: 600,
            whiteSpace: 'nowrap', textDecoration: 'none',
          }}>
            Pre-order →
          </Link>
        </div>
      )}

      {/* Listings live banner */}
      {listingVisible && !preorderOpen && !todayMarket && tomorrowMarket && currentHour >= TIMING.LISTING_OPEN_HOUR && (
        <div style={{
          background: 'rgba(27,67,50,0.08)',
          borderBottom: '1px solid var(--cream-dark)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <Clock size={14} color="var(--green)" />
          <div style={{ fontSize: 13, color: 'var(--green)' }}>
            <strong>{tomorrowMarket.name}</strong> listings are live — pre-orders open at 6PM tonight
          </div>
        </div>
      )}

      {/* Rest day banner */}
      {!listingVisible && !todayMarket && (
        <div style={{
          background: 'var(--charcoal)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
              🌙 The market is quiet today
            </div>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              Next: <strong style={{ color: 'var(--gold)' }}>{nextMarket.name}</strong> — {formatMarketDate(nextDate)}
            </div>
            <div style={{ color: 'var(--green-muted)', fontSize: 11, marginTop: 2 }}>
              Listings & pre-orders open at 12PM the day before
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MARKET SLIDESHOW — appears before hero text
          ============================================ */}
      <MarketSlideshow />

      {/* Hero text section — below the slideshow */}
      <div style={{
        background: 'linear-gradient(160deg, var(--green) 0%, var(--green-light) 60%, #40916C 100%)',
        padding: '36px 24px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            color: 'var(--green-muted)',
            fontSize: 12, fontWeight: 600,
            letterSpacing: 2, marginBottom: 12,
          }}>
            {getHeroSubtitle()}
          </div>

          {/* FIX — lineHeight 1.25 prevents descender overlap */}
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            color: 'white',
            fontSize: 'clamp(28px, 7vw, 48px)',
            fontWeight: 900,
            lineHeight: 1.25,
            marginBottom: 14,
          }}>
            Fresh from the<br />
            <span style={{ color: 'var(--gold)' }}>village.</span><br />
            Only on market days.
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 15, lineHeight: 1.6,
            marginBottom: 24, maxWidth: 380,
          }}>
            Fresh farm produce from traditional village markets — delivered directly to city buyers. No middlemen. No markup. Just fresh.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {orderingState !== 'browse_only' ? (
              <Link to="/market" className="btn-primary" style={{ fontSize: 15, padding: '13px 24px' }}>
                {heroCTA.icon}
                {heroCTA.label}
              </Link>
            ) : (
              <button
                className="btn-primary"
                style={{ fontSize: 15, padding: '13px 24px' }}
                onClick={() => setShowPopup(true)}
              >
                {heroCTA.icon}
                {heroCTA.label}
              </button>
            )}
            <Link to="/market" className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: 14 }}>
              Browse Products
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { icon: '🌿', text: 'Farm fresh' },
              { icon: '🚐', text: 'Delivered to your city' },
              { icon: '📦', text: 'Food grade packaging' },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: 'rgba(255,255,255,0.7)', fontSize: 13,
              }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active market card */}
      {(todayMarket || (preorderOpen && tomorrowMarket)) && (
        <div style={{ padding: '0 16px', marginTop: -20 }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: '20px',
            boxShadow: 'var(--shadow-lg)',
            borderLeft: `4px solid ${orderingState === 'same_day' ? 'var(--orange)' : 'var(--gold)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              <div style={{
                fontSize: 12,
                color: orderingState === 'same_day' ? 'var(--orange)' : 'var(--gold)',
                fontWeight: 600, marginBottom: 4,
              }}>
                {orderingState === 'same_day' ? '🌿 OPEN NOW' : '🌅 PRE-ORDER OPEN'}
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700 }}>
                {todayMarket?.name || tomorrowMarket?.name}
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>
                {todayMarket?.location || tomorrowMarket?.location}
              </div>
            </div>
            <Link to="/market" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '12px 20px' }}>
              {orderingState === 'same_day' ? 'Shop Now' : 'Pre-order'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* FIX — Categories with fixed emoji height for baseline alignment */}
      <div style={{ padding: '36px 16px 0' }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 24, fontWeight: 700, marginBottom: 16,
        }}>
          What we carry
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
          gap: 10,
        }}>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              to={`/market?category=${cat.slug}`}
              style={{
                background: 'white',
                borderRadius: 12,
                padding: '14px 6px 12px',
                textAlign: 'center',
                boxShadow: 'var(--shadow)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              {/* Fixed height forces all emojis to same baseline */}
              <div style={{
                height: 36,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6,
              }}>
                <span style={{ fontSize: 26, lineHeight: 1 }}>{cat.emoji}</span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: 'var(--charcoal)', lineHeight: 1.3,
              }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Seasonal intelligence */}
      {currentSeasonal.length > 0 && (
        <div style={{ padding: '36px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <TrendingDown size={20} color="var(--gold)" />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700 }}>
              What's cheaper now
            </h2>
          </div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
            {getSeasonLabel()} — buy direct and save vs city market prices
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentSeasonal.map(item => (
              <div key={item.name} style={{
                background: 'white', borderRadius: 12, padding: '16px',
                boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ fontSize: 32 }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <div>
                      <div style={{ color: '#888' }}>Village price</div>
                      <div style={{ color: 'var(--green)', fontWeight: 700 }}>{item.villagePrice}</div>
                    </div>
                    <div>
                      <div style={{ color: '#888' }}>City price</div>
                      <div style={{ color: '#999', textDecoration: 'line-through' }}>{item.cityPrice}</div>
                    </div>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(27,67,50,0.08)',
                  borderRadius: 8, padding: '8px 12px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: '#888' }}>You save</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>{item.save}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div style={{ padding: '36px 16px 0' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
          How it works
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { step: '01', title: 'Browse from noon, day before', desc: 'Listings go live at 12PM the day before market. Pre-order that evening for guaranteed first pick at 5AM.', icon: '📱' },
            { step: '02', title: 'We shop for you', desc: 'Our market agent buys your items fresh from village sellers early morning before the market fills up.', icon: '🛒' },
            { step: '03', title: 'Packaged clean', desc: 'Every item is sorted, prepped and packed in food-grade transparent bags. Meat processed fresh on market morning.', icon: '📦' },
            { step: '04', title: 'Collect in your city', desc: 'Pick up in Aba from 3PM or Umuahia from 12:30PM. Or pay a keke rider for door delivery.', icon: '🚐' },
          ].map(({ step, title, desc, icon }, i) => (
            <div key={step} style={{ display: 'flex', gap: 16, position: 'relative' }}>
              {i < 3 && (
                <div style={{
                  position: 'absolute', left: 20, top: 52, bottom: 0, width: 2,
                  background: 'linear-gradient(to bottom, var(--green-muted), transparent)',
                }} />
              )}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0, zIndex: 1,
              }}>
                {icon}
              </div>
              <div style={{ paddingBottom: 28 }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--green)', marginBottom: 4 }}>{step}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next market preview */}
      <div style={{ padding: '36px 16px 40px' }}>
        <div style={{
          background: 'var(--green)', borderRadius: 16,
          padding: '24px', textAlign: 'center',
        }}>
          <div style={{ color: 'var(--green-muted)', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>
            COMING UP
          </div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            {nextMarket.name}
          </h3>
          <div style={{ color: 'var(--gold)', fontSize: 14, marginBottom: 6 }}>
            {formatMarketDate(nextDate)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 20 }}>
            Listings go live at 12PM the day before
          </div>
          <button
            className="btn-secondary"
            style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', margin: '0 auto', display: 'flex' }}
            onClick={() => setShowPopup(true)}
          >
            <Bell size={16} />
            Notify me when listings are live
          </button>
        </div>
      </div>

    </div>
  )
}
