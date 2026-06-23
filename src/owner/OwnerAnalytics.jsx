import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatNaira } from '../lib/paystack'

export default function OwnerAnalytics() {
  const [data, setData] = useState({ topBuyers: [], zoneBreakdown: [], productStats: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [buyersRes, ordersRes, itemsRes] = await Promise.all([
        supabase.from('buyer_profiles').select('full_name, whatsapp, total_orders, total_spent, is_wholesale').order('total_spent', { ascending: false }).limit(10),
        supabase.from('orders').select('total, status, pickup_zone:pickup_zones(city), created_at').in('status', ['paid', 'packed', 'dispatched', 'collected']),
        supabase.from('order_items').select('product_name, quantity, total_price'),
      ])

      const zones = {}
      ;(ordersRes.data || []).forEach(o => {
        const city = o.pickup_zone?.city || 'Unknown'
        if (!zones[city]) zones[city] = { orders: 0, revenue: 0 }
        zones[city].orders++
        zones[city].revenue += o.total
      })

      const products = {}
      ;(itemsRes.data || []).forEach(i => {
        if (!products[i.product_name]) products[i.product_name] = { qty: 0, revenue: 0 }
        products[i.product_name].qty += i.quantity
        products[i.product_name].revenue += i.total_price
      })

      setData({
        topBuyers: buyersRes.data || [],
        zoneBreakdown: Object.entries(zones).map(([city, s]) => ({ city, ...s })),
        productStats: Object.entries(products).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8).map(([name, s]) => ({ name, ...s })),
      })
      setLoading(false)
    }
    fetchData()
  }, [])

  const maxRevenue = Math.max(...data.productStats.map(p => p.revenue), 1)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--charcoal)', paddingBottom: 40 }}>
      <div style={{ background: '#111', padding: '20px 16px', borderBottom: '1px solid #222' }}>
        <Link to="/owner" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 14, marginBottom: 16 }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 24, fontWeight: 700 }}>Analytics</h1>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>Loading analytics...</div> : (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '20px' }}>
            <div style={{ color: '#555', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 16 }}>PICKUP ZONE PERFORMANCE</div>
            {data.zoneBreakdown.map(({ city, orders, revenue }) => (
              <div key={city} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'white', fontWeight: 600 }}>{city}</span>
                  <span style={{ color: 'var(--green-muted)', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>{orders} orders · {formatNaira(revenue)}</span>
                </div>
                <div style={{ height: 6, background: '#2a2a2a', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--green)', borderRadius: 3, width: `${Math.min(100, (orders / Math.max(...data.zoneBreakdown.map(z => z.orders), 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
            {data.zoneBreakdown.length === 0 && <div style={{ color: '#555' }}>No data yet</div>}
          </div>

          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '20px' }}>
            <div style={{ color: '#555', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 16 }}>TOP PRODUCTS BY REVENUE</div>
            {data.productStats.map(({ name, qty, revenue }, i) => (
              <div key={name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'white', fontSize: 13 }}><span style={{ color: '#555', fontFamily: 'DM Mono, monospace', marginRight: 8 }}>#{i + 1}</span>{name}</span>
                  <span style={{ color: 'var(--green-muted)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{formatNaira(revenue)}</span>
                </div>
                <div style={{ height: 4, background: '#2a2a2a', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: i === 0 ? 'var(--gold)' : 'var(--green-muted)', borderRadius: 2, width: `${(revenue / maxRevenue) * 100}%` }} />
                </div>
              </div>
            ))}
            {data.productStats.length === 0 && <div style={{ color: '#555' }}>No product data yet</div>}
          </div>

          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '20px' }}>
            <div style={{ color: '#555', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 16 }}>TOP BUYERS</div>
            {data.topBuyers.slice(0, 6).map((buyer, i) => (
              <div key={buyer.whatsapp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: i < 5 ? '1px solid #222' : 'none' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {buyer.full_name}
                    {buyer.is_wholesale && <span style={{ background: 'var(--gold)', color: 'white', fontSize: 9, padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>WHOLESALE</span>}
                  </div>
                  <div style={{ color: '#555', fontSize: 12 }}>{buyer.whatsapp} · {buyer.total_orders} orders</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--green-muted)', fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>{formatNaira(buyer.total_spent || 0)}</div>
                  <a href={`https://wa.me/${buyer.whatsapp?.replace(/\D/g, '')}`} target="_blank" style={{ color: '#25D366', fontSize: 11, textDecoration: 'none' }}>Message →</a>
                </div>
              </div>
            ))}
            {data.topBuyers.length === 0 && <div style={{ color: '#555' }}>No buyers yet</div>}
          </div>
        </div>
      )}
    </div>
  )
}
