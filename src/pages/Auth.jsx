import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ZONES = [
  { id: 'aba-zone-id', name: 'Aba', landmark: 'Osisioma Junction' },
  { id: 'umuahia-zone-id', name: 'Umuahia', landmark: 'Ubani Motor Park Area' },
]

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', fullName: '', whatsapp: '', zoneId: ZONES[0].id })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn({ email: form.email, password: form.password })
        toast.success('Welcome back!')
        navigate('/')
      } else {
        if (!form.fullName || !form.whatsapp) { toast.error('Please fill in all fields'); setLoading(false); return }
        await signUp(form)
        toast.success('Account created! Welcome to Only Market Days.')
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--green)', padding: '20px 20px 40px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-muted)', fontSize: 14, marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🌿</span>
          <span style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 22, fontWeight: 700 }}>Only Market Days</span>
        </div>
        <p style={{ color: 'var(--green-muted)', fontSize: 14 }}>{mode === 'login' ? 'Welcome back. Your fresh produce awaits.' : 'Create your account to start ordering.'}</p>
      </div>

      <div style={{ flex: 1, padding: '0 16px', marginTop: -20 }}>
        <div className="card" style={{ padding: '28px 24px', maxWidth: 420, margin: '0 auto' }}>
          <div style={{ display: 'flex', background: 'var(--cream-dark)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: mode === m ? 'var(--green)' : 'transparent', color: mode === m ? 'white' : '#888' }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Full Name *</label>
                  <input name="fullName" placeholder="Chioma Okafor" value={form.fullName} onChange={handleChange}
                    style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>WhatsApp Number *</label>
                  <input name="whatsapp" type="tel" placeholder="08012345678" value={form.whatsapp} onChange={handleChange}
                    style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Your City *</label>
                  <select name="zoneId" value={form.zoneId} onChange={handleChange}
                    style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white', color: 'var(--charcoal)' }}>
                    {ZONES.map(z => <option key={z.id} value={z.id}>{z.name} — {z.landmark}</option>)}
                  </select>
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Email Address *</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange}
                  style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white' }} />
                <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: '#aaa' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
          {mode === 'signup' && (
            <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
              By creating an account, you agree to receive WhatsApp notifications about your orders and market day alerts.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
