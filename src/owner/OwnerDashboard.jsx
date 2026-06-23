import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Users, TrendingUp, LogOut, ArrowRight } from 'lucide-react'
import { useOwner } from './OwnerApp'
import { supabase } from '../lib/supabase'
import { formatNaira } from '../lib/paystack'
import { getTodaysMarket, getNextMarket, formatMarketDate } from '../lib/marketCalendar'

export default function OwnerDashboard() {
  const { logout } = useOwner()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ todayOrders: 0, todayRevenue: 0, monthOrders: 0, monthRevenue: 0, totalCustomers: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const now = new Date()
  const todayMarket = getTodaysMarket(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)

  useEffect(() => {
    async function fetchStats() {
      const today = new Date().toISOString().split('T')[0]
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const [todayRes, monthRes, customersRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total').gte('created_at', today + 'T00:00:00').in('status', ['paid', 'packed', 'dispatched', 'collected']),
        supabase.from('orders').select('total').gte('created_at', monthStart).in('status', ['paid', 'packed', 'dispatched', 'collected']),
        supabase.from('buyer_profiles').select('id', { count: 'exact' }),
        supabase.from('orders').select('*, pickup_zone:pickup_zones(city, name)').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({
        todayOrders: todayRes.data?.length || 0,
        todayRevenue: todayRes.data?.reduce((s, o) => s + o.total, 0) || 0,
        monthOrders: monthRes.data?.length || 0,
        monthRevenue: monthRes.data?.reduce((s, o) => s + o.total, 0) || 0,
        totalCustomers: customersRes.count || 0,
      })
      setRecentOrders(recentRes.data || [])
    }
    fetchStats()
  }, [])

  const STATUS_COLORS = { paid: '#2D6A4F', packed: '#E85D04', dispatched: '#1B4332', collected: '#74C69D', cancelled: '#999' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--charcoal)', paddingBottom: 40 }}>
      <div style={{ background: '#111', padding: '24px 20px 28px', borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 700, margin: '0 auto' }}>
          <div>
            <div style={{ color: '#555', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>OWNER DASHBOARD</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 26, fontWeight: 700 }}>Only Market Days</h1>
          </div>
          <button onClick={() => { logout(); navigate('/') }} style={{ background: '#222', borderRadius: 8, padding: '8px 14px', color: '#888', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <LogOut size={15} /> Exit
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ background: todayMarket ? 'var(--green)' : '#1a1a1a', borderRadius: 14, padding: '18px 20px', marginBottom: 20, border: todayMarket ? 'none' : '1px solid #333' }}>
          {todayMarket ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--green-muted)', fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>🌿 MARKET OPEN TODAY</div>
                <div style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 22, fontWeight: 700 }}>{todayMarket.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'white', fontFamily: 'DM Mono, monospace', fontSize: 28, fontWeight: 900 }}>{stats.todayOrders}</div>
                <div style={{ color: 'var(--green-muted)', fontSize: 12 }}>orders today</div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ color: '#555', fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>🌙 REST DAY</div>
              <div style={{ color: '#888', fontSize: 15 }}>Next: <span style={{ color: 'white', fontWeight: 600 }}>{nextMarket.name}</span></div>
              <div style={{ color: '#555', fontSize: 13 }}>{formatMarketDate(nextDate)}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[{ label: "Today's orders", value: stats.todayOrders }, { label: 'Revenue today', value: formatNaira(stats.todayRevenue) }, { label: 'Month revenue', value: formatNaira(stats.monthRevenue) }].map(({ label, value }) => (
            <div key={label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '14px 12px' }}>
              <div style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>{label}</div>
              <div style={{ color: 'white', fontFamily: 'DM Mono, monospace', fontSize: 15, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
          <div style={{ color: '#555', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 16 }}>THIS MONTH</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[{ label: 'Orders', value: stats.monthOrders, icon: ShoppingBag }, { label: 'Customers', value: stats.totalCustomers, icon: Users }, { label: 'Revenue', value: formatNaira(stats.monthRevenue), icon: TrendingUp }].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <Icon size={20} color="var(--green-muted)" style={{ marginBottom: 8 }} />
                <div style={{ color: 'white', fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{value}</div>
                <div style={{ color: '#555', fontSize: 12 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <Link to="/owner/orders" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: 20, marginBottom: 4 }}>📋</div><div style={{ fontWeight: 600, fontSize: 14 }}>All Orders</div></div>
            <ArrowRight size={18} color="#555" />
          </Link>
          <Link to="/owner/analytics" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: 20, marginBottom: 4 }}>📊</div><div style={{ fontWeight: 600, fontSize: 14 }}>Analytics</div></div>
            <ArrowRight size={18} color="#555" />
          </Link>
        </div>

        <div style={{ color: '#555', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 14 }}>RECENT ORDERS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentOrders.map(order => (
            <div key={order.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'DM Mono, monospace', color: 'white', fontWeight: 700, fontSize: 15 }}>#{order.order_number}</div>
                <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{order.buyer_name} · {order.pickup_zone?.city}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green-muted)', fontWeight: 700 }}>{formatNaira(order.total)}</div>
                <span style={{ background: STATUS_COLORS[order.status] || '#333', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase' }}>{order.status}</span>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && <div style={{ color: '#555', textAlign: 'center', padding: '30px', background: '#1a1a1a', borderRadius: 12 }}>No orders yet</div>}
        </div>
      </div>
    </div>
  )
}
