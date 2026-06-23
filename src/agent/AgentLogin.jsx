import { useState } from 'react'
import { useAgent } from './AgentApp'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function AgentLogin() {
  const { loginAgent } = useAgent()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!phone || pin.length < 4) { toast.error('Enter your phone number and 4-digit PIN'); return }
    setLoading(true)
    const { data, error } = await supabase.from('agents').select('*, market:markets(name)').eq('phone', phone).eq('is_active', true).single()
    if (error || !data) { toast.error('Agent not found. Check your phone number.'); setLoading(false); return }
    if (data.pin_hash !== pin) { toast.error('Incorrect PIN'); setLoading(false); return }
    loginAgent(data)
    toast.success(`Welcome, ${data.full_name}!`)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Agent Portal</h1>
          <div style={{ color: 'var(--green-muted)', fontSize: 14 }}>Only Market Days — Isiala Ngwa North</div>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: '28px 24px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, marginBottom: 20 }}>Sign In</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Phone Number</label>
              <input type="tel" placeholder="080xxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 16, outline: 'none', letterSpacing: 2 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>4-Digit PIN</label>
              <input type="password" placeholder="••••" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 24, outline: 'none', letterSpacing: 8, textAlign: 'center' }} />
            </div>
            <button onClick={handleLogin} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, marginTop: 8 }}>
              {loading ? 'Checking...' : 'Enter Portal'}
            </button>
          </div>
          <div style={{ marginTop: 20, padding: '14px', background: 'var(--cream)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>🔒 This portal is for market agents only. Forgot your PIN? Contact the market coordinator.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
