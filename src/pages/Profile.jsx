import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Star, ArrowRight, ShoppingBasket } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatNaira } from '../lib/paystack'

export default function Profile() {
  const { user, profile, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => { if (!user && !loading) navigate('/auth') }, [user, loading])

  useEffect(() => {
    if (user) {
      supabase.from('orders').select('*, pickup_zone:pickup_zones(name, city)').eq('buyer_id', user.id).order('created_at', { ascending: false }).limit(10)
        .then(({ data }) => { setOrders(data || []); setOrdersLoading(false) })
    }
  }, [user])

  async function handleSignOut() { await signOut(); navigate('/') }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--green)' }}>Loading...</div>
  if (!user) return null

  const STATUS_COLORS = { paid: '#2D6A4F', agent_shopping: '#D4A017', packed: '#E85D04', dispatched: '#1B4332', collected: '#74C69D', cancelled: '#999', refunded: '#666' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 100 }}>
      <Navbar />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ background: 'var(--green)', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--green-muted)', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>YOUR ACCOUNT</div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{profile?.full_name || 'Market Buyer'}</h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>📱 {profile?.whatsapp}</div>
              {profile?.is_wholesale && (
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gold)', borderRadius: 6, padding: '4px 10px' }}>
                  <Star size={12} color="white" />
                  <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>Wholesale Member</span>
                </div>
              )}
            </div>
            <button onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <LogOut size={15} />Sign out
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            {[{ label: 'Total orders', value: profile?.total_orders || 0 }, { label: 'Total spent', value: formatNaira(profile?.total_spent || 0) }].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ color: 'var(--green-muted)', fontSize: 11, marginBottom: 4 }}>{label}</div>
                <div style={{ color: 'white', fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 18 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {!profile?.is_wholesale && (profile?.total_orders || 0) >= 3 && (
          <div style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid var(--gold)', borderRadius: 12, padding: '16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>⭐ Upgrade to Wholesale</div>
              <div style={{ fontSize: 13, color: '#666' }}>You've ordered {profile?.total_orders} times. Bulk pricing unlocks now.</div>
            </div>
            <ArrowRight size={20} color="var(--gold)" />
          </div>
        )}

        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Your Orders</h2>

        {ordersLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, marginBottom: 8 }}>No orders yet</h3>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Your first order from Isiala Ngwa North awaits.</p>
            <Link to="/market" className="btn-primary"><ShoppingBasket size={16} />Browse the Market</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => (
              <div key={order.id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 16, color: 'var(--green)' }}>#{order.order_number}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <span style={{ background: STATUS_COLORS[order.status] || '#999', color: 'white', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555' }}>
                  <span>📍 {order.pickup_zone?.name}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--charcoal)' }}>{formatNaira(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
