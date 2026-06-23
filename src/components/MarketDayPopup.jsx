import { useState, useEffect } from 'react'
import { X, Clock, MapPin, ShoppingBasket, Bell } from 'lucide-react'
import { getTodaysMarket, getNextMarket, getTagline, formatMarketDate, isOrderOpen, isPreorderOpen, TIMING } from '../lib/marketCalendar'
import { Link } from 'react-router-dom'

function Countdown({ targetHour, targetMin = 0 }) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    function calc() {
      const now = new Date()
      const target = new Date()
      target.setHours(targetHour, targetMin, 0, 0)
      if (target <= now) { setTimeLeft('Closed'); return }
      const diff = target - now
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetHour, targetMin])
  return <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>{timeLeft}</span>
}

export default function MarketDayPopup({ onClose }) {
  const now = new Date()
  const todaysMarket = getTodaysMarket(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowMarket = getTodaysMarket(tomorrow)
  const tagline = todaysMarket ? getTagline(todaysMarket, now) : getTagline(nextMarket, now)
  const daysUntil = Math.round(
    (new Date(nextDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000
  )

  // Rest day — show small dismissible banner, NOT a blocking modal
  if (!todaysMarket && !preorderOpen) {
    return (
      <div style={{
        position: 'fixed',
        top: 56,
        left: 0,
        right: 0,
        zIndex: 200,
        padding: '0 16px',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: 'var(--charcoal)',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          pointerEvents: 'all',
          animation: 'slideUp 0.3s ease',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
              🌙 Market is quiet today
            </div>
            <div style={{ color: '#aaa', fontSize: 12 }}>
              Next: <strong style={{ color: 'var(--gold)' }}>{nextMarket.name}</strong> — {formatMarketDate(nextDate)}
            </div>
            <div style={{ color: 'var(--green-muted)', fontSize: 12, marginTop: 2 }}>
              Pre-order opens tonight at 6PM
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none',
            borderRadius: 8, padding: 6, color: 'white', cursor: 'pointer', display: 'flex',
          }}>
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  // Market day or preorder — show full popup
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(27,67,50,0.85)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(4px)',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--cream)', borderRadius: 20, width: '100%', maxWidth: 420,
        overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.4s ease',
      }}>
        <div style={{
          background: todaysMarket ? 'var(--green)' : '#2D6A4F',
          padding: '28px 24px 24px', position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.1)', border: 'none',
            borderRadius: 8, padding: 6, color: 'white', cursor: 'pointer', display: 'flex',
          }}>
            <X size={18} />
          </button>

          {todaysMarket ? (
            <>
              <div style={{ color: 'var(--green-muted)', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>
                🌿 TODAY'S MARKET IS LIVE
              </div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 36, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
                {todaysMarket.name}
              </h1>
              <div style={{ color: 'var(--green-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} />{todaysMarket.location}
              </div>
              <div style={{ marginTop: 16, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontStyle: 'italic', lineHeight: 1.5 }}>
                "{tagline}"
              </div>
            </>
          ) : (
            <>
              <div style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>
                🌅 PRE-ORDER OPEN TONIGHT
              </div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 32, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
                {tomorrowMarket?.name}
              </h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                Opens tomorrow — pre-order now for guaranteed first pick at 5AM
              </div>
            </>
          )}
        </div>

        {todaysMarket && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--cream-dark)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Order closes', value: '10:00 AM' },
                { label: 'Umuahia pickup', value: '12:30 PM' },
                { label: 'Aba pickup', value: '3:00 PM' },
                { label: 'Pre-order opens', value: '6:00 PM' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'white', border: '1px solid var(--cream-dark)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, fontSize: 14 }}>{value}</div>
                </div>
              ))}
            </div>
            {orderOpen && (
              <div style={{ marginTop: 10, background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color="var(--orange)" />
                <span style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 600 }}>
                  Orders close in <Countdown targetHour={TIMING.ORDER_CLOSE_HOUR} /> — order now
                </span>
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {todaysMarket && orderOpen ? (
            <Link to="/market" onClick={onClose} className="btn-primary" style={{ justifyContent: 'center' }}>
              <ShoppingBasket size={18} />Shop {todaysMarket.name} Now
            </Link>
          ) : preorderOpen ? (
            <Link to="/market" onClick={onClose} className="btn-primary" style={{ justifyContent: 'center' }}>
              <ShoppingBasket size={18} />Pre-order for Tomorrow
            </Link>
          ) : (
            <Link to="/market" onClick={onClose} className="btn-primary" style={{ justifyContent: 'center' }}>
              <ShoppingBasket size={18} />Browse Products
            </Link>
          )}
          <button onClick={onClose} style={{ background: 'transparent', color: '#999', fontSize: 13, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  )
}
