import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatNaira } from '../lib/paystack'
import toast from 'react-hot-toast'

const STATUSES = ['all', 'paid', 'packed', 'dispatched', 'collected', 'cancelled', 'refunded']
const STATUS_COLORS = { paid: '#2D6A4F', packed: '#E85D04', dispatched: '#1B4332', collected: '#74C69D', cancelled: '#666', refunded: '#999' }

export default function OwnerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data } = await supabase.from('orders')
      .select('*, pickup_zone:pickup_zones(name, city), items:order_items(product_name, quantity, product_unit, unit_price, total_price)')
      .order('created_at', { ascending: false }).limit(100)
    setOrders(data || [])
    setLoading(false)
  }

  async function handleRefund(order) {
    if (!confirm(`Refund ₦${(order.total / 100).toLocaleString()} to ${order.buyer_name}?`)) return
    const { error } = await supabase.from('orders').update({ status: 'refunded' }).eq('id', order.id)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'refunded' } : o))
      setSelected(prev => prev?.id === order.id ? { ...prev, status: 'refunded' } : prev)
      toast.success('Order marked as refunded. Process refund via Paystack dashboard.')
    } else toast.error('Failed to update status')
  }

  const filtered = orders
    .filter(o => statusFilter === 'all' || o.status === statusFilter)
    .filter(o => !search || o.order_number?.includes(search.toUpperCase()) || o.buyer_name?.toLowerCase().includes(search.toLowerCase()) || o.buyer_whatsapp?.includes(search))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--charcoal)', paddingBottom: 40 }}>
      <div style={{ background: '#111', padding: '20px 16px', borderBottom: '1px solid #222' }}>
        <Link to="/owner" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 14, marginBottom: 16 }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 24, fontWeight: 700 }}>All Orders</h1>
          <button onClick={fetchOrders} style={{ background: '#222', borderRadius: 8, padding: '8px', color: '#888' }}><RefreshCw size={16} /></button>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '16px' }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input placeholder="Search by order number, name, or WhatsApp..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '11px 12px 11px 36px', borderRadius: 8, border: '1px solid #333', background: '#1a1a1a', color: 'white', fontSize: 14, outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 16 }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap', border: '1px solid', borderColor: statusFilter === s ? STATUS_COLORS[s] || 'var(--green)' : '#333', background: statusFilter === s ? STATUS_COLORS[s] || 'var(--green)' : '#1a1a1a', color: statusFilter === s ? 'white' : '#666', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
              {s} {s !== 'all' && `(${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>Loading...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(order => (
              <div key={order.id} onClick={() => setSelected(selected?.id === order.id ? null : order)}
                style={{ background: '#1a1a1a', border: `1px solid ${selected?.id === order.id ? 'var(--green)' : '#2a2a2a'}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'DM Mono, monospace', color: 'white', fontWeight: 700, fontSize: 16 }}>#{order.order_number}</div>
                    <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{order.buyer_name} · {order.buyer_whatsapp} · {order.pickup_zone?.city}</div>
                    <div style={{ color: '#444', fontSize: 11, marginTop: 2 }}>{new Date(order.created_at).toLocaleString('en-NG')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green-muted)', fontWeight: 700, fontSize: 15 }}>{formatNaira(order.total)}</div>
                    <span style={{ background: STATUS_COLORS[order.status] || '#333', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase' }}>{order.status?.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {selected?.id === order.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #2a2a2a' }}>
                    <div style={{ marginBottom: 10 }}>
                      {(order.items || []).map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 13, marginBottom: 4 }}>
                          <span>{item.product_name} × {item.quantity} {item.product_unit}</span>
                          <span style={{ fontFamily: 'DM Mono, monospace' }}>{formatNaira(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                    {order.special_instructions && <div style={{ fontSize: 12, color: 'var(--orange)', marginBottom: 12, fontStyle: 'italic' }}>📝 {order.special_instructions}</div>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={`https://wa.me/${order.buyer_whatsapp?.replace(/\D/g, '')}`} target="_blank"
                        style={{ flex: 1, padding: '10px', background: '#25D366', color: 'white', borderRadius: 8, textAlign: 'center', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                        💬 WhatsApp {order.buyer_name?.split(' ')[0]}
                      </a>
                      {!['cancelled', 'refunded', 'collected'].includes(order.status) && (
                        <button onClick={e => { e.stopPropagation(); handleRefund(order) }}
                          style={{ padding: '10px 16px', background: '#2a1a1a', border: '1px solid #5a2a2a', color: '#ff6b6b', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          Refund
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>No orders match your filter</div>}
          </div>
        )}
      </div>
    </div>
  )
}
