import { Link, useLocation } from 'react-router-dom'
import { ShoppingBasket, User, Home, Store } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { cartCount } = useCart()
  const { user } = useAuth()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav style={{
        background: 'var(--green)', padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🌿</span>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', color: 'var(--cream)', fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>
              Only Market Days
            </div>
            <div style={{ color: 'var(--green-muted)', fontSize: 11, letterSpacing: 1 }}>
              ISIALA NGWA NORTH • ABIA STATE
            </div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/market" style={{
            color: isActive('/market') ? 'var(--cream)' : 'var(--green-muted)',
            padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
            background: isActive('/market') ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}>Market</Link>
          <Link to={user ? '/profile' : '/auth'} style={{ color: 'var(--green-muted)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
            <User size={20} />
          </Link>
          <Link to="/cart" style={{
            position: 'relative', color: 'var(--cream)', background: 'var(--orange)',
            padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600,
          }}>
            <ShoppingBasket size={18} />
            {cartCount > 0 && (
              <span style={{ background: 'white', color: 'var(--orange)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid var(--cream-dark)', display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { icon: Home, label: 'Home', path: '/' },
          { icon: Store, label: 'Market', path: '/market' },
          { icon: User, label: 'Account', path: user ? '/profile' : '/auth' },
          { icon: ShoppingBasket, label: 'Cart', path: '/cart', badge: cartCount },
        ].map(({ icon: Icon, label, path, badge }) => (
          <Link key={path} to={path} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 0', gap: 4,
            color: isActive(path) ? 'var(--green)' : '#999',
            fontSize: 11, fontWeight: isActive(path) ? 600 : 400,
          }}>
            <div style={{ position: 'relative' }}>
              <Icon size={22} />
              {badge > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -8, background: 'var(--orange)', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                  {badge}
                </span>
              )}
            </div>
            {label}
          </Link>
        ))}
      </div>
    </>
  )
}
