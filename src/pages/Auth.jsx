import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, Phone, Bell, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getTodaysMarket } from '../lib/marketCalendar'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

function SpinningMark({ size = 52, isMarketDay = false }) {
  const spinDuration = isMarketDay ? '3s' : '8s'
  return (
    <>
      <style>{`
        @keyframes spinMarketAuth {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .omd-auth-spin {
          animation: spinMarketAuth ${spinDuration} linear infinite;
          transform-origin: center;
          display: block;
        }
      `}</style>
      <svg width={size} height={size} viewBox="0 0 190 190" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <g className="omd-auth-spin">
          <path d="M95 95 L95 10 A85 85 0 0 0 10 95 Z"  fill="#1B4332"/>
          <path d="M95 95 L95 10 A85 85 0 0 1 180 95 Z" fill="#C0522B"/>
          <path d="M95 95 L10 95 A85 85 0 0 0 95 180 Z" fill="#9B7E46"/>
          <path d="M95 95 L180 95 A85 85 0 0 1 95 180 Z" fill="#5C3D1E"/>
          <circle cx="95" cy="95" r="85" stroke="#1B4332" strokeWidth="3" fill="none"/>
          <line x1="95" y1="10"  x2="95"  y2="180" stroke="#F7F3EC" strokeWidth="2"/>
          <line x1="10" y1="95"  x2="180" y2="95"  stroke="#F7F3EC" strokeWidth="2"/>
          <circle cx="95" cy="95" r="28" fill="#F7B731" opacity="0.2"/>
          <circle cx="95" cy="95" r="20" fill="#F7B731"/>
          <circle cx="95" cy="95" r="13" fill="#FFD460"/>
          {[0,45,90,135,180,225,270,315].map((angle) => {
            const rad = (angle * Math.PI) / 180
            return (
              <line key={angle}
                x1={95 + Math.cos(rad) * 23} y1={95 + Math.sin(rad) * 23}
                x2={95 + Math.cos(rad) * 33} y2={95 + Math.sin(rad) * 33}
                stroke="#F7B731" strokeWidth="4" strokeLinecap="round"
              />
            )
          })}
          <circle cx="95"  cy="10"  r="5" fill="#F7B731"/>
          <circle cx="180" cy="95"  r="5" fill="#F7B731"/>
          <circle cx="95"  cy="180" r="5" fill="#F7B731"/>
          <circle cx="10"  cy="95"  r="5" fill="#F7B731"/>
          <line x1="42" y1="36" x2="60" y2="54" stroke="#F7F3EC" strokeWidth="5" strokeLinecap="round"/>
          <line x1="60" y1="36" x2="42" y2="54" stroke="#F7F3EC" strokeWidth="5" strokeLinecap="round"/>
          <text x="51" y="76" textAnchor="middle" fill="#F7F3EC" fontSize="13" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">EKE</text>
          <circle cx="138" cy="45" r="13" stroke="#F7F3EC" strokeWidth="4.5" fill="none"/>
          <text x="138" y="76" textAnchor="middle" fill="#F7F3EC" fontSize="13" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">ORIE</text>
          <line x1="48" y1="114" x2="48" y2="138" stroke="#F7F3EC" strokeWidth="4.5" strokeLinecap="round"/>
          <line x1="61" y1="114" x2="61" y2="138" stroke="#F7F3EC" strokeWidth="4.5" strokeLinecap="round"/>
          <text x="54" y="157" textAnchor="middle" fill="#F7F3EC" fontSize="13" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">AFỌ</text>
          <rect x="126" y="114" width="26" height="26" stroke="#F7F3EC" strokeWidth="4.5" fill="none" rx="1"/>
          <text x="139" y="157" textAnchor="middle" fill="#F7F3EC" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">NKWỌ</text>
        </g>
      </svg>
    </>
  )
}

// ============================================
// PASSWORD STRENGTH INDICATOR
// ============================================
function PasswordStrength({ password }) {
  const len = password.length
  if (len === 0) return null

  const met = len >= 6
  const strong = len >= 10

  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Bar */}
      <div style={{ height: 4, background: 'var(--cream-dark)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          borderRadius: 2,
          width: strong ? '100%' : met ? '60%' : `${(len / 6) * 40}%`,
          background: strong ? '#22c55e' : met ? 'var(--green)' : 'var(--orange)',
          transition: 'width 0.3s ease, background 0.3s ease',
        }} />
      </div>

      {/* Requirements */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {[
          { label: 'At least 6 characters', met: len >= 6 },
          { label: 'Strong password (10+ characters)', met: len >= 10 },
        ].map(({ label, met: isMet }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: isMet ? '#22c55e' : 'var(--cream-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}>
              {isMet && <Check size={10} color="white" strokeWidth={3} />}
            </div>
            <span style={{
              fontSize: 11,
              color: isMet ? '#22c55e' : '#aaa',
              transition: 'color 0.2s',
              fontWeight: isMet ? 600 : 400,
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// WAITLIST SCREEN
// ============================================
function WaitlistScreen({ region, onBack }) {
  const [whatsapp, setWhatsapp] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleJoin() {
    if (whatsapp.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid WhatsApp number')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('region_waitlist').insert({
      region_id: region.id,
      whatsapp: whatsapp.replace(/\D/g, ''),
      city: city || null,
    })
    if (error) {
      toast.error('Something went wrong. Try again.')
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🌿</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          You are on the list!
        </h2>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
          We will message you on WhatsApp the day Only Market Days launches in <strong>{region.name}</strong>.
        </p>
        <button onClick={onBack} className="btn-secondary" style={{ margin: '0 auto', display: 'flex' }}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: 'var(--green)', borderRadius: 16, padding: '24px', textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌙</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Coming Soon to {region.name}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6 }}>
          We are sourcing the best village markets and training agents in your area. Be the first to know when we launch.
        </p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
          Join the Waitlist
        </h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
          We will WhatsApp you the day we go live in {region.name}.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>
              WhatsApp Number *
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input
                type="tel"
                placeholder="08012345678"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 15, outline: 'none', background: 'white', boxSizing: 'border-box', fontFamily: 'DM Mono, monospace' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>
              Your City in {region.state} State
            </label>
            <input
              type="text"
              placeholder={`e.g. ${region.state === 'Enugu' ? 'Enugu, Nsukka' : region.state === 'Imo' ? 'Owerri, Orlu' : 'Your city'}`}
              value={city}
              onChange={e => setCity(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, opacity: loading ? 0.7 : 1 }}
          >
            <Bell size={18} />
            {loading ? 'Joining...' : 'Notify Me When We Launch'}
          </button>
        </div>

        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, marginTop: 16, cursor: 'pointer', display: 'block', width: '100%', textAlign: 'center' }}>
          ← Choose a different state
        </button>
      </div>
    </div>
  )
}

// ============================================
// MAIN AUTH COMPONENT
// ============================================
export default function Auth() {
  const [mode, setMode] = useState('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [regions, setRegions] = useState([])
  const [zones, setZones] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [showWaitlist, setShowWaitlist] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const isMarketDay = !!getTodaysMarket(new Date())

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    password: '',
    regionId: '',
    zoneId: '',
  })

  // Fetch regions on mount
  useEffect(() => {
    async function fetchRegions() {
      const { data } = await supabase
        .from('regions')
        .select('*')
        .order('is_active', { ascending: false })
        .order('name')
      if (data) {
        setRegions(data)
        const firstActive = data.find(r => r.is_active)
        if (firstActive) {
          setSelectedRegion(firstActive)
          setForm(prev => ({ ...prev, regionId: firstActive.id }))
          fetchZones(firstActive.id)
        }
      }
    }
    fetchRegions()
  }, [])

  async function fetchZones(regionId) {
    const { data } = await supabase
      .from('pickup_zones')
      .select('id, name, city, landmark')
      .eq('region_id', regionId)
      .eq('active', true)
      .order('city')
    if (data && data.length > 0) {
      setZones(data)
      setForm(prev => ({ ...prev, zoneId: data[0].id }))
    } else {
      setZones([])
      setForm(prev => ({ ...prev, zoneId: '' }))
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleRegionChange(e) {
    const regionId = e.target.value
    const region = regions.find(r => r.id === regionId)

    // Prevent selecting coming soon regions
    if (region && !region.is_active) {
      setSelectedRegion(region)
      setForm(prev => ({ ...prev, regionId, zoneId: '' }))
      setZones([])
      return
    }

    setSelectedRegion(region)
    setForm(prev => ({ ...prev, regionId, zoneId: '' }))
    if (region?.is_active) fetchZones(regionId)
  }

  function validate() {
    if (mode === 'signup') {
      if (!form.fullName.trim()) { toast.error('Please enter your full name'); return false }
      if (!form.email.includes('@')) { toast.error('Please enter a valid email'); return false }
      if (form.whatsapp.replace(/\D/g, '').length < 10) { toast.error('Please enter a valid WhatsApp number'); return false }
      if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false }
      if (!form.regionId) { toast.error('Please select your state'); return false }
    }
    if (mode === 'login') {
      if (!form.email.includes('@')) { toast.error('Please enter your email'); return false }
      if (!form.password) { toast.error('Please enter your password'); return false }
    }
    return true
  }

  async function handleSubmit() {
    if (mode === 'signup' && selectedRegion && !selectedRegion.is_active) {
      setShowWaitlist(true)
      return
    }
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn({ email: form.email, password: form.password })
        toast.success('Welcome back!')
        navigate('/')
      } else {
        await signUp({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          whatsapp: form.whatsapp.replace(/\D/g, ''),
          zoneId: form.zoneId || null,
          regionId: form.regionId || null,
        })
        toast.success('Account created! Welcome to Only Market Days.')
        navigate('/')
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('already registered')) {
        toast.error('This email already has an account. Please sign in.')
        setMode('login')
      } else if (msg.includes('Invalid login')) {
        toast.error('Wrong email or password')
      } else {
        toast.error(msg || 'Something went wrong. Try again.')
      }
    }
    setLoading(false)
  }

  if (showWaitlist && selectedRegion) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
        <div style={{ background: 'var(--green)', padding: '20px 20px 32px' }}>
          <button onClick={() => setShowWaitlist(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-muted)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <SpinningMark size={44} isMarketDay={isMarketDay} />
            <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 18 }}>
              <span style={{ color: '#FFFFFF' }}>ONLY </span>
              <span style={{ color: '#C0522B' }}>MARKET </span>
              <span style={{ color: '#F7B731' }}>DAYS</span>
            </div>
          </div>
        </div>
        <WaitlistScreen region={selectedRegion} onBack={() => setShowWaitlist(false)} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>

      <div style={{ background: 'var(--green)', padding: '20px 20px 48px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-muted)', fontSize: 14, marginBottom: 28 }}>
          <ArrowLeft size={16} /> Back
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <SpinningMark size={56} isMarketDay={isMarketDay} />
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 20, whiteSpace: 'nowrap', lineHeight: 1.2 }}>
              <span style={{ color: '#FFFFFF' }}>ONLY </span>
              <span style={{ color: '#C0522B' }}>MARKET </span>
              <span style={{ color: '#F7B731' }}>DAYS</span>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, fontFamily: 'sans-serif', marginTop: 3 }}>
              EKE · ORIE · AFỌ · NKWỌ
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--green-muted)', fontSize: 14, marginTop: 4 }}>
          {mode === 'login'
            ? 'Welcome back. Your fresh produce awaits.'
            : 'Create your account to start ordering fresh.'}
        </p>
      </div>

      <div style={{ flex: 1, padding: '0 16px', marginTop: -24 }}>
        <div className="card" style={{ padding: '28px 24px', maxWidth: 420, margin: '0 auto' }}>

          <div style={{ display: 'flex', background: 'var(--cream-dark)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: mode === m ? 'var(--green)' : 'transparent',
                color: mode === m ? 'white' : '#888',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Full name */}
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Full Name *</label>
                <input
                  name="fullName"
                  placeholder="e.g. Chioma Okafor"
                  value={form.fullName}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Email Address *</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}
              />
            </div>

            {/* WhatsApp */}
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>
                  WhatsApp Number *
                  <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 4 }}>(for order updates)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                  <input
                    name="whatsapp"
                    type="tel"
                    placeholder="08012345678"
                    value={form.whatsapp}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 15, outline: 'none', background: 'white', boxSizing: 'border-box', fontFamily: 'DM Mono, monospace', letterSpacing: 1 }}
                  />
                </div>
              </div>
            )}

            {/* State selector */}
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Your State *</label>
                {regions.length > 0 ? (
                  <div style={{ position: 'relative' }}>
                    <select
                      name="regionId"
                      value={form.regionId}
                      onChange={handleRegionChange}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 8,
                        border: '1.5px solid var(--cream-dark)', fontSize: 14,
                        outline: 'none', background: 'white',
                        color: 'var(--charcoal)', boxSizing: 'border-box',
                        appearance: 'none',
                      }}
                    >
                      {/* Active regions first */}
                      <optgroup label="Available Now">
                        {regions.filter(r => r.is_active).map(r => (
                          <option key={r.id} value={r.id}>
                            ✅ {r.name}
                          </option>
                        ))}
                      </optgroup>

                      {/* Coming soon — visually separated */}
                      <optgroup label="Coming Soon">
                        {regions.filter(r => !r.is_active).map(r => (
                          <option
                            key={r.id}
                            value={r.id}
                            style={{ color: '#bbb' }}
                          >
                            🌙 {r.name} — Coming Soon
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    {/* Custom dropdown arrow */}
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#aaa', fontSize: 12 }}>▾</div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'var(--cream)', fontSize: 13, color: '#888' }}>
                    Loading states...
                  </div>
                )}

                {/* Coming soon notice */}
                {selectedRegion && !selectedRegion.is_active && (
                  <div style={{ marginTop: 8, background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, color: '#8B6914', fontWeight: 600, marginBottom: 2 }}>
                      🌙 Not yet available in {selectedRegion.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#8B6914' }}>
                      Tap "Join Waitlist" and we'll WhatsApp you when we launch there.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* City — only for active regions */}
            {mode === 'signup' && selectedRegion?.is_active && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Your City *</label>
                {zones.length > 0 ? (
                  <select
                    name="zoneId"
                    value={form.zoneId}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, outline: 'none', background: 'white', color: 'var(--charcoal)', boxSizing: 'border-box' }}
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.city} — {z.landmark}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: '12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'var(--cream)', fontSize: 13, color: '#888' }}>
                    Loading cities...
                  </div>
                )}
              </div>
            )}

            {/* Password with real-time strength indicator */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{
                    width: '100%', padding: '12px 40px 12px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${
                      mode === 'signup' && form.password.length > 0
                        ? form.password.length >= 6
                          ? '#22c55e'
                          : 'var(--orange)'
                        : 'var(--cream-dark)'
                    }`,
                    fontSize: 14, outline: 'none', background: 'white',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: showPw || form.password.length === 0 ? '50%' : '30%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Real-time strength indicator — signup only */}
              {mode === 'signup' && <PasswordStrength password={form.password} />}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, marginTop: 8, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Please wait...' :
                mode === 'login' ? 'Sign In' :
                selectedRegion && !selectedRegion.is_active ? '🔔 Join Waitlist' :
                'Create Account'}
            </button>
          </div>

          {mode === 'signup' && selectedRegion?.is_active && (
            <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
              You'll receive order updates on your WhatsApp number.
            </p>
          )}

          {mode === 'login' && (
            <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: 16 }}>
              Forgot your password? Contact us on WhatsApp for a reset.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
