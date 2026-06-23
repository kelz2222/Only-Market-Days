import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, User, MessageCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatNaira, calculateServiceFee, initiatePayment, generateReference } from '../lib/paystack'
import { supabase } from '../lib/supabase'
import { isOrderOpen, isPreorderOpen, getNextMarket } from '../lib/marketCalendar'
import toast from 'react-hot-toast'

const ZONES = [
  { id: 'aba', name: 'Aba Pickup', landmark: 'Osisioma Junction, Aba', time: '3:00 PM', fee: 80000, bulk_fee: 200000 },
  { id: 'umuahia', name: 'Umuahia Pickup', landmark: 'Ubani Motor Park Area, Umuahia', time: '12:30 PM', fee: 120000, bulk_fee: 250000 },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const [zone, setZone] = useState(ZONES[0])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: profile?.full_name || '',
    whatsapp: profile?.whatsapp || '',
    email: user?.email || '',
    instructions: '',
  })

  const now = new Date()
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)
  const orderType = preorderOpen && !orderOpen ? 'preorder' : 'same_day'
  const hasBulk = cartItems.some(i => i.is_bulk)
  const deliveryFee = hasBulk ? zone.bulk_fee : zone.fee
  const serviceFee = calculateServiceFee(orderType, cartTotal)
  const total = cartTotal + deliveryFee + serviceFee

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleCheckout() {
    if (!form.fullName || !form.whatsapp || !form.email) {
      toast.error('Please fill in all required fields')
      return
    }
    if (cartTotal < 350000) {
      toast.error('Minimum order is ₦3,500')
      return
    }
    setLoading(true)
    const reference = generateReference(Date.now())
    try {
      await initiatePayment({
        email: form.email,
        amount: total,
        reference,
        metadata: { buyer_name: form.fullName, whatsapp: form.whatsapp, zone: zone.name, order_type: orderType },
        onSuccess: async (response) => {
          try {
            const { data: order, error } = await supabase.from('orders').insert({
              buyer_id: user?.id || null,
              pickup_zone_id: zone.id,
              order_type: orderType,
              status: 'paid',
              subtotal: cartTotal,
              delivery_fee: deliveryFee,
              service_fee: serviceFee,
              total,
              paystack_reference: response.reference,
              paystack_status: 'success',
              buyer_name: form.fullName,
              buyer_whatsapp: form.whatsapp,
              special_instructions: form.instructions,
            }).select().single()

            if (!error && order) {
              await supabase.from('order_items').insert(
                cartItems.map(item => ({
                  order_id: order.id,
                  product_id: item.id,
                  product_name: item.name,
                  product_unit: item.unit,
                  quantity: item.qty,
                  unit_price: item.price,
                  total_price: item.price * item.qty,
                }))
              )
              clearCart()
              navigate(`/order/${order.order_number}`)
            } else {
              clearCart()
              navigate(`/order/${response.reference}?paid=true`)
            }
          } catch (err) {
            clearCart()
            navigate(`/order/${response.reference}?paid=true`)
          }
        },
        onClose: () => {
          setLoading(false)
          toast('Payment cancelled. Your basket is still saved.', { icon: '👛' })
        },
      })
    } catch (err) {
      setLoading(false)
      toast.error('Could not load payment. Check your connection.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 120 }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px' }}>
        <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 14, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to basket
        </Link>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Checkout</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{orderType === 'preorder' ? '🌅 Pre-order — secured at 5AM tomorrow' : '🌿 Same-day order'}</p>

        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, marginBottom: 16 }}>Your Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { name: 'fullName', label: 'Full Name', icon: User, placeholder: 'e.g. Chioma Okafor', type: 'text' },
              { name: 'whatsapp', label: 'WhatsApp Number', icon: MessageCircle, placeholder: '080xxxxxxxx', type: 'tel' },
              { name: 'email', label: 'Email (for payment)', icon: Phone, placeholder: 'your@email.com', type: 'email' },
            ].map(({ name, label, icon: Icon, placeholder, type }) => (
              <div key={name}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>{label} *</label>
                <div style={{ position: 'relative' }}>
                  <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                  <input name={name} type={type} placeholder={placeholder} value={form[name]} onChange={handleChange}
                    style={{ width: '100%', padding: '11px 12px 11px 36px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white' }} />
                </div>
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Special Instructions (optional)</label>
              <textarea name="instructions" placeholder="e.g. shred the ugu leaves, I prefer unripe plantain..." value={form.instructions} onChange={handleChange} rows={2}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', resize: 'none', background: 'white' }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, marginBottom: 16 }}>
            <MapPin size={16} style={{ display: 'inline', marginRight: 6 }} />Pickup Zone
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ZONES.map(z => (
              <div key={z.id} onClick={() => setZone(z)} style={{ border: `2px solid ${zone.id === z.id ? 'var(--green)' : 'var(--cream-dark)'}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', background: zone.id === z.id ? 'rgba(27,67,50,0.04)' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{z.name}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{z.landmark}</div>
                    <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4, fontWeight: 600 }}>Ready from {z.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>{formatNaira(hasBulk ? z.bulk_fee : z.fee)}</div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${zone.id === z.id ? 'var(--green)' : '#ccc'}`, background: zone.id === z.id ? 'var(--green)' : 'transparent', marginLeft: 'auto', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {zone.id === z.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>💡 Keke last-mile delivery available at pickup point (₦500–₦1,000, paid directly to keke).</div>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, marginBottom: 16 }}>Summary</h3>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#555' }}>
              <span>{item.name} × {item.qty}</span>
              <span style={{ fontFamily: 'DM Mono, monospace' }}>{formatNaira(item.price * item.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--cream-dark)', marginTop: 12, paddingTop: 12 }}>
            {[{ label: 'Subtotal', value: formatNaira(cartTotal) }, { label: 'Delivery', value: formatNaira(deliveryFee) }, { label: 'Service fee', value: formatNaira(serviceFee) }].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#666', marginBottom: 8 }}>
                <span>{label}</span><span style={{ fontFamily: 'DM Mono, monospace' }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--cream-dark)' }}>
              <span>Total</span>
              <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>{formatNaira(total)}</span>
            </div>
          </div>
        </div>

        <button onClick={handleCheckout} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: 17, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Opening payment...' : `Pay ${formatNaira(total)}`}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 12 }}>🔒 Secured by Paystack. WhatsApp confirmation sent after payment.</p>
      </div>
    </div>
  )
}
