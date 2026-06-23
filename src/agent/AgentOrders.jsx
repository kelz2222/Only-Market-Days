import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Package, Truck, CheckCircle, Phone, Printer } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatNaira } from '../lib/paystack'
import toast from 'react-hot-toast'

const STATUS_FLOW = {
  paid: { label: 'Paid — Ready to pack', next: 'packed', nextLabel: 'Mark as Packed', color: '#2D6A4F', bg: 'rgba(45,106,79,0.1)' },
  packed: { label: 'Packed', next: 'dispatched', nextLabel: 'Mark as Dispatched', color: 'var(--orange)', bg: 'rgba(232,93,4,0.08)' },
  dispatched: { label: 'Dispatched', next: 'collected', nextLabel: 'Mark as Collected', color: 'var(--green)', bg: 'rgba(27,67,50,0.06)' },
  collected: { label: 'Collected ✓', next: null, color: 'var(--green-muted)', bg: 'rgba(116,198,157,0.1)' },
}

export default function AgentOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeZone, setActiveZone] = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('orders')
      .select('*, items:order_items(product_name, quantity, product_unit, unit_price), pickup_zone:pickup_zones(name, city, arrival_time)')
      .gte('created_at', today + 'T00:00:00')
      .in('status', ['paid', 'packed', 'dispatched', 'collected'])
      .order('created_at', { ascending: true })
    if (data) setOrders(data)
    setLoading(false)
  }

  async function updateStatus(orderId, newStatus, whatsapp, buyerName, zone) {
    setUpdating(orderId)
    const { error } = await supabase.from('orders').update({
      status: newStatus,
      ...(newStatus === 'packed' ? { packed_at: new Date().toISOString() } : {}),
      ...(newStatus === 'dispatched' ? { dispatched_at: new Date().toISOString() } : {}),
      ...(newStatus === 'collected' ? { collected_at: new Date().toISOString() } : {}),
    }).eq('id', orderId)

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      const messages = {
        packed: `Hi ${buyerName}! Your Only Market Days order is packed and ready. It will be dispatched to ${zone} soon.`,
        dispatched: `Hi ${buyerName}! Your Only Market Days order is on its way to ${zone}. Please collect it on arrival. Show your order number to the driver.`,
        collected: `Hi ${buyerName}! Your order has been collected. Thank you for shopping with Only Market Days! Fresh from the village 🌿`,
      }
      const msg = messages[newStatus]
      if (msg) window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
      toast.success(`Order marked as ${newStatus}`)
    } else {
      toast.error('Update failed. Try again.')
    }
    setUpdating(null)
  }

  function printOrders(zoneFilter) {
    const zoneOrders = zoneFilter === 'all' ? orders : orders.filter(o => o.pickup_zone?.city === zoneFilter)
    const html = `<html><head><title>Only Market Days — Order Sheet</title>
    <style>body{font-family:Arial,sans-serif;padding:20px;font-size:13px;}h1{font-size:20px;margin-bottom:4px;}.order{border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:12px;page-break-inside:avoid;}.order-num{font-size:22px;font-weight:900;font-family:monospace;color:#1B4332;}.checkbox{border:1.5px solid #333;width:16px;height:16px;display:inline-block;margin-right:8px;vertical-align:middle;}@media print{.no-print{display:none;}}</style></head><body>
    <h1>Only Market Days — Order Sheet</h1>
    <div style="color:#666;margin-bottom:20px;font-size:12px;">Date: ${new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | Zone: ${zoneFilter === 'all' ? 'ALL ZONES' : zoneFilter.toUpperCase()} | Total: ${zoneOrders.length}</div>
    ${zoneOrders.map(o => `<div class="order"><span class="checkbox"></span><span class="order-num">#${o.order_number}</span> <span style="background:#1B4332;color:white;padding:2px 8px;border-radius:4px;font-size:11px;">${o.pickup_zone?.city || ''}</span>${o.order_type === 'preorder' ? ' <span style="background:#D4A017;color:white;padding:2px 6px;border-radius:4px;font-size:11px;">PRE-ORDER</span>' : ''}<div style="font-weight:600;margin-top:8px;">${o.buyer_name}</div><div style="color:#666;font-size:12px;">📱 ${o.buyer_whatsapp}</div><div style="margin-top:8px;padding-left:12px;">${(o.items || []).map(i => `<div>• ${i.product_name} × ${i.quantity} ${i.product_unit}</div>`).join('')}</div>${o.special_instructions ? `<div style="margin-top:6px;font-size:12px;color:#888;font-style:italic">Note: ${o.special_instructions}</div>` : ''}<div style="font-weight:700;margin-top:8px;">Total: ₦${((o.total || 0) / 100).toLocaleString()}</div><div style="margin-top:6px;font-size:12px;color:#888;">Pickup: ${o.pickup_zone?.name} — from ${o.pickup_zone?.arrival_time}</div></div>`).join('')}
    <script>window.onload = () => window.print()</script></body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
  }

  const filtered = activeZone === 'all' ? orders : orders.filter(o => o.pickup_zone?.city === activeZone)
  const counts = { paid: orders.filter(o => o.status === 'paid').length, packed: orders.filter(o => o.status === 'packed').length, dispatched: orders.filter(o => o.status === 'dispatched').length, collected: orders.filter(o => o.status === 'collected').length }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 60 }}>
      <div style={{ background: 'var(--green)', padding: '20px 16px 24px' }}>
        <Link to="/agent" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-muted)', fontSize: 14, marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 24, fontWeight: 700 }}>Today's Orders</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 16 }}>
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
              <div style={{ color: 'white', fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 18 }}>{count}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'capitalize' }}>{status}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all', 'Umuahia', 'Aba'].map(z => (
            <button key={z} onClick={() => setActiveZone(z)} style={{ padding: '8px 16px', borderRadius: 20, border: '1.5px solid', borderColor: activeZone === z ? 'var(--green)' : 'var(--cream-dark)', background: activeZone === z ? 'var(--green)' : 'white', color: activeZone === z ? 'white' : 'var(--charcoal)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {z === 'all' ? 'All Zones' : z}
            </button>
          ))}
          <button onClick={() => printOrders(activeZone)} style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 20, background: 'var(--charcoal)', color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
            <Printer size={15} /> Print Sheet
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, marginBottom: 8 }}>No orders yet</h3>
            <p style={{ color: '#888', fontSize: 14 }}>Orders appear here after buyers pay on market day.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(order => {
              const statusInfo = STATUS_FLOW[order.status] || STATUS_FLOW.paid
              return (
                <div key={order.id} className="card" style={{ padding: '16px', borderLeft: `4px solid ${statusInfo.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 20, fontWeight: 900, color: 'var(--green)' }}>#{order.order_number}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <span style={{ background: 'var(--green)', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{order.pickup_zone?.city}</span>
                        {order.order_type === 'preorder' && <span style={{ background: 'var(--gold)', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>PRE-ORDER</span>}
                      </div>
                    </div>
                    <div style={{ background: statusInfo.bg, color: statusInfo.color, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>{statusInfo.label}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{order.buyer_name}</div>
                    <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {order.buyer_whatsapp}</div>
                  </div>
                  <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                    {(order.items || []).map((item, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#555', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.product_name} × {item.quantity} {item.product_unit}</span>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>{formatNaira(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.special_instructions && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--orange)', fontStyle: 'italic' }}>📝 {order.special_instructions}</div>}
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--cream-dark)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Total</span>
                      <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>{formatNaira(order.total)}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>📍 {order.pickup_zone?.name} — from {order.pickup_zone?.arrival_time}</div>
                  {statusInfo.next && (
                    <button onClick={() => updateStatus(order.id, statusInfo.next, order.buyer_whatsapp, order.buyer_name, order.pickup_zone?.city)} disabled={updating === order.id}
                      style={{ width: '100%', padding: '12px', background: statusInfo.next === 'dispatched' ? 'var(--orange)' : 'var(--green)', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: updating === order.id ? 0.7 : 1, cursor: 'pointer' }}>
                      {statusInfo.next === 'packed' && <Package size={16} />}
                      {statusInfo.next === 'dispatched' && <Truck size={16} />}
                      {statusInfo.next === 'collected' && <CheckCircle size={16} />}
                      {updating === order.id ? 'Updating...' : statusInfo.nextLabel}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
