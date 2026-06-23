import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Upload, ClipboardList, LogOut } from 'lucide-react'
import { useAgent } from './AgentApp'
import { supabase } from '../lib/supabase'
import { formatNaira } from '../lib/paystack'
import { getTodaysMarket, getNextMarket, formatMarketDate } from '../lib/marketCalendar'

export default function AgentDashboard() {
  const { agent, logoutAgent } = useAgent()
  const [stats, setStats] = useState({ total: 0, packed: 0, dispatched: 0, earnings: 0 })
  const now = new Date()
  const todayMarket = getTodaysMarket(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)

  useEffect(() => {
    async function fetchStats() {
      const today = new Date().toISOString().split('T')[0]
      const { data: orders } = await supabase.from('orders').select('status, total').gte('created_at', today + 'T00:00:00').in('status', ['paid', 'agent_shopping', 'packed', 'dispatched', 'collected'])
      if (orders) {
        const total = orders.length
        const packed = orders.filter(o => ['packed', 'dispatched', 'collected'].includes(o.status)).length
        const dispatched = orders.filter(o => ['dispatched', 'collected'].includes(o.status)).length
        setStats({ total, packed, dispatched, earnings: 500000 + (total * 15000) })
      }
    }
    fetchStats()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 40 }}>
      <div style={{ background: 'var(--green)', padding: '24px 20px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'var(--green-muted)', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>AGENT PORTAL</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{agent?.full_name}</h1>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{agent?.market?.name || 'Orie Market'} Agent</div>
          </div>
          <button onClick={logoutAgent} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
        <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>
          {todayMarket ? (
            <div>
              <div style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>🌿 TODAY'S MARKET</div>
              <div style={{ color: 'white', fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700 }}>{todayMarket.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Orders close 10:00 AM • Arrive by 5:00 AM for pre-orders</div>
            </div>
          ) : (
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>🌙 REST DAY</div>
              <div style={{ color: 'white', fontSize: 15 }}>Next: <strong>{nextMarket.name}</strong> — {formatMarketDate(nextDate)}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: "Today's orders", value: stats.total, icon: '📋', color: 'var(--green)' },
            { label: 'Packed', value: stats.packed, icon: '📦', color: 'var(--orange)' },
            { label: 'Dispatched', value: stats.dispatched, icon: '🚐', color: '#2D6A4F' },
            { label: "Today's earnings", value: formatNaira(stats.earnings), icon: '💰', color: 'var(--gold)' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card" style={{ padding: '16px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, marginBottom: 14 }}>What do you need to do?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link to="/agent/upload" style={{ background: 'var(--orange)', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, color: 'white', textDecoration: 'none' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>Upload Products</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Add items from today's market with photo and price</div>
            </div>
          </Link>
          <Link to="/agent/orders" style={{ background: 'var(--green)', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, color: 'white', textDecoration: 'none' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>Manage Orders</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>View, pack, and dispatch orders by zone</div>
            </div>
          </Link>
        </div>

        <div style={{ marginTop: 24, background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)', borderRadius: 12, padding: '16px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#8B6914' }}>📋 Market Day Checklist</div>
          {['Arrive at market by 5AM (pre-orders)', 'Fill all pre-orders first before listing', 'Upload products by 9:30AM', 'Orders close at 10AM — stop shopping', 'Package by 11:30AM — load van by 12PM', 'Umuahia departs first → Aba second', 'Photograph each labelled bag before loading'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, fontSize: 13, color: '#555' }}>
              <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
