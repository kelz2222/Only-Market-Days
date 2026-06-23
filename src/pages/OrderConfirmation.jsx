import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CheckCircle, MapPin, Clock, MessageCircle, Home } from 'lucide-react'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'
import { formatNaira } from '../lib/paystack'

export default function OrderConfirmation() {
  const { orderNumber } = useParams()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*, pickup_zone:pickup_zones(*), items:order_items(*)')
        .eq('order_number', orderNumber)
        .single()
      setOrder(data)
      setLoading(false)
    }
    fetchOrder()
  }, [orderNumber])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 80 }}>
      <Navbar />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(27,67,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={44} color="var(--green)" />
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Order Confirmed!</h1>
          <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6 }}>Your fresh produce is being sourced right now at the market in Isiala Ngwa North.</p>
        </div>

        <div style={{ background: 'var(--green)', borderRadius: 16, padding: '20px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ color: 'var(--green-muted)', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>YOUR ORDER NUMBER</div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: 4 }}>{orderNumber}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 }}>Show this number to the driver at pickup</div>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <div style={{ background: 'rgba(27,67,50,0.04)', borderRadius: 10, padding: '16px', borderLeft: '3px solid var(--green)', marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--green)', lineHeight: 1.6, fontStyle: 'italic' }}>
              "Real village women. Real farm produce. No supermarket. No cold storage. Just fresh — harvested this morning at Isiala Ngwa North, Abia State."
            </p>
          </div>

          {order ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <MapPin size={16} color="var(--green)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{order.pickup_zone?.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{order.pickup_zone?.landmark}</div>
                  <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Ready from {order.pickup_zone?.arrival_time}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageCircle size={16} color="var(--green)" />
                <div style={{ fontSize: 13, color: '#555' }}>You'll receive a WhatsApp message when your order is packed and dispatched.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="var(--green)" />
              <div style={{ fontSize: 13, color: '#555' }}>Umuahia pickup from 12:30PM — Aba pickup from 3:00PM</div>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, marginBottom: 16 }}>What happens next</h3>
          {[
            { time: 'Now', label: 'Your order is confirmed and paid', icon: '✅' },
            { time: 'Market morning', label: 'Agent secures your items fresh from the market', icon: '🛒' },
            { time: '10AM', label: 'Your order is packaged and labelled', icon: '📦' },
            { time: '12PM', label: 'WhatsApp notification — order dispatched', icon: '🚐' },
            { time: 'Pickup time', label: 'Collect with your order number', icon: '🎉' },
          ].map(({ time, label, icon }) => (
            <div key={time} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--green)', marginBottom: 2 }}>{time}</div>
                <div style={{ fontSize: 14, color: '#555' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <Link to="/" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
          <Home size={18} />Back to Home
        </Link>
      </div>
    </div>
  )
}
