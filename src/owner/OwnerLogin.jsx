import { useState } from 'react'
import { useOwner } from './OwnerApp'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OwnerLogin() {
  const { login } = useOwner()
  const navigate = useNavigate()
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)

  function handleLogin() {
    if (login(pw)) { toast.success('Welcome back, boss.'); navigate('/owner') }
    else toast.error('Incorrect password')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--charcoal)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 28, marginBottom: 4 }}>Owner Dashboard</h1>
          <div style={{ color: '#888', fontSize: 14 }}>Only Market Days — Private Access</div>
        </div>
        <div style={{ background: '#1a1a1a', borderRadius: 16, padding: '28px 24px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={show ? 'text' : 'password'} placeholder="Enter owner password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', padding: '14px 44px 14px 14px', borderRadius: 8, border: '1.5px solid #333', background: '#252525', color: 'white', fontSize: 15, outline: 'none' }} />
              <button onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: '#666' }}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button onClick={handleLogin} style={{ width: '100%', padding: '14px', borderRadius: 8, background: 'var(--green)', color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
            Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
