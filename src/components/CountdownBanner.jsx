import { useState, useEffect } from 'react'
import {
  getTodaysMarket, getTomorrowsMarket, getNextMarket,
  isOrderOpen, isPreorderOpen, isListingVisible,
  getOrderingState, TIMING, formatMarketDate,
} from '../lib/marketCalendar'
import { Link } from 'react-router-dom'
import WeatherBanner from './WeatherBanner'

export default function CountdownBanner() {
  const [now, setNow] = useState(new Date())
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date()
      setNow(n)

      const todayMarket = getTodaysMarket(n)
      const orderOpen = isOrderOpen(n)
      const preorderOpen = isPreorderOpen(n)
      const tomorrowMarket = getTomorrowsMarket(n)

      if (todayMarket && orderOpen) {
        // Countdown to 10AM order close
        const close = new Date(n)
        close.setHours(TIMING.ORDER_CLOSE_HOUR, 0, 0, 0)
        const diff = close - n
        if (diff > 0) {
          const h = Math.floor(diff / 3600000)
          const m = Math.floor((diff % 3600000) / 60000)
          const s = Math.floor((diff % 60000) / 1000)
          setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`)
        }
      } else if (preorderOpen && tomorrowMarket) {
        // Countdown to preorder close (7AM tomorrow)
        const close = new Date(n)
        close.setDate(close.getDate() + 1)
        close.setHours(TIMING.ORDER_OPEN_HOUR, 0, 0, 0)
        const diff = close - n
        if (diff > 0) {
          const h = Math.floor(diff / 3600000)
          const m = Math.floor((diff % 3600000) / 60000)
          setTimeLeft(`${h}h ${m}m`)
        }
      } else {
        // Countdown to next market listing going live (noon day before)
        const { date: nextDate } = getNextMarket(n)
        const listingOpen = new Date(nextDate)
        listingOpen.setDate(listingOpen.getDate() - 1)
        listingOpen.setHours(TIMING.LISTING_OPEN_HOUR, 0, 0, 0)
        const diff = listingOpen - n
        if (diff > 0) {
          const days = Math.floor(diff / 86400000)
          const h = Math.floor((diff % 86400000) / 3600000)
          const m = Math.floor((diff % 3600000) / 60000)
          if (days > 0) setTimeLeft(`${days}d ${h}h`)
          else setTimeLeft(`${h}h ${m}m`)
        }
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const todayMarket = getTodaysMarket(now)
  const tomorrowMarket = getTomorrowsMarket(now)
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)
  const listingVis = isListingVisible(now)
  const orderingState = getOrderingState(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)

  let bg = 'var(--green)'
  let content = null

  if (todayMarket && orderOpen) {
    bg = 'var(--orange)'
    content = (
      <Link to="/market" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>🌿</span>
        <strong>{todayMarket.name} is LIVE</strong>
        <span style={{ opacity: 0.9 }}>— orders close in</span>
        <span style={{ fontFamily: 'DM Mono, monospace', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6 }}>
          {timeLeft}
        </span>
      </Link>
    )
  } else if (todayMarket && !orderOpen) {
    bg = 'var(--green)'
    content = (
      <span style={{ color: 'var(--green-muted)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        <span>🌿</span>
        <span>{todayMarket.name} — same-day orders closed</span>
        {preorderOpen && tomorrowMarket && (
          <Link to="/market" style={{ color: 'var(--gold)', fontWeight: 700, marginLeft: 4 }}>
            Pre-order for {tomorrowMarket.name} →
          </Link>
        )}
      </span>
    )
  } else if (preorderOpen && tomorrowMarket) {
    bg = '#2D6A4F'
    content = (
      <Link to="/market" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>🌅</span>
        <strong>Pre-order open</strong>
        <span style={{ opacity: 0.9 }}>for {tomorrowMarket.name} — closes in</span>
        <span style={{ fontFamily: 'DM Mono, monospace', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6 }}>
          {timeLeft}
        </span>
      </Link>
    )
  } else if (listingVis && tomorrowMarket) {
    bg = 'rgba(27,67,50,0.9)'
    content = (
      <Link to="/market" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        <span>📋</span>
        <span>{tomorrowMarket.name} listings are live — pre-orders open at 6PM</span>
      </Link>
    )
  } else {
    bg = 'var(--green)'
    content = (
      <span style={{ color: 'var(--green-muted)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        <span>🌙</span>
        <span>Next listings go live in</span>
        <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--gold)', fontWeight: 700 }}>{timeLeft}</span>
        <span>—</span>
        <strong style={{ color: 'white' }}>{nextMarket.name}</strong>
      </span>
    )
  }

  return (
    <div>
      {/* Main countdown bar */}
      <div style={{
        background: bg,
        padding: '10px 16px',
        textAlign: 'center',
        fontSize: 13,
        transition: 'background 0.5s ease',
      }}>
        {content}
      </div>

      {/* Weather banner below countdown */}
      <WeatherBanner />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
