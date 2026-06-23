import { useState, useEffect } from 'react'
import { getTodaysMarket, getNextMarket, formatMarketDate, isOrderOpen, isPreorderOpen, TIMING } from '../lib/marketCalendar'
import { Link } from 'react-router-dom'

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
      if (todayMarket && orderOpen) {
        const close = new Date(n)
        close.setHours(TIMING.ORDER_CLOSE_HOUR, 0, 0, 0)
        const diff = close - n
        if (diff > 0) {
          const h = Math.floor(diff / 3600000)
          const m = Math.floor((diff % 3600000) / 60000)
          const s = Math.floor((diff % 60000) / 1000)
          setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`)
        }
      } else if (preorderOpen) {
        const close = new Date(n)
        close.setHours(TIMING.PREORDER_CLOSE_HOUR, 0, 0, 0)
        const diff = close - n
        if (diff > 0) setTimeLeft(`${Math.floor(diff / 60000)}m`)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const todayMarket = getTodaysMarket(now)
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)
  const daysUntil = Math.round((new Date(nextDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000)

  let bg = 'var(--green)'
  let content = null

  if (todayMarket && orderOpen) {
    bg = 'var(--orange)'
    content = (
      <Link to="/market" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: 16 }}>🌿</span>
        <strong>{todayMarket.name}</strong>
        <span style={{ opacity: 0.9 }}>is OPEN —</span>
        <span style={{ fontFamily: 'DM Mono, monospace', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6 }}>{timeLeft} left</span>
        <span style={{ opacity: 0.9 }}>to order</span>
      </Link>
    )
  } else if (todayMarket && !orderOpen) {
    content = (
      <span style={{ color: 'var(--green-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🌿</span>
        <span>{todayMarket.name} — orders closed. Next: <strong style={{ color: 'white' }}>{nextMarket.name}</strong> in {daysUntil} days</span>
      </span>
    )
  } else if (preorderOpen) {
    bg = '#2D6A4F'
    content = (
      <Link to="/market" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>🌅</span>
        <span>Pre-order window open — closes in <strong style={{ fontFamily: 'DM Mono, monospace' }}>{timeLeft}</strong></span>
      </Link>
    )
  } else {
    content = (
      <span style={{ color: 'var(--green-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🌙</span>
        <span>Rest day — Next market: <strong style={{ color: 'white' }}>{nextMarket.name}</strong> in <strong style={{ color: 'var(--gold)' }}>{daysUntil} day{daysUntil !== 1 ? 's' : ''}</strong></span>
      </span>
    )
  }

  return (
    <div style={{ background: bg, padding: '10px 16px', textAlign: 'center', fontSize: 13, transition: 'background 1s ease' }}>
      {content}
    </div>
  )
}
