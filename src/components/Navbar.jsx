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
      {/* Top navbar */}
      <nav style={{
        background: 'var(--green)',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{
              fontFamily: 'Playfair Display, serif',
              color: 'var(--cream)',
              fontSize: 15,
              fontWeight: 700,
            }}>
              Only Market Days
            <div style={{
  color: 'var(--green-muted)',
  fontSize: 9,
  letterSpacing: 0.8,
  whiteSpace: 'nowrap',
}}>
  FRESH VILLAGE PRODUCE • DELIVERED TO YOUR CITY
</div>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/market" style={{
            color: isActive('/market') ? 'var(--cream)' : 'var(--green-muted)',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            background: isActive('/market') ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}>
            Market
          </Link>

          <Link to={user ? '/profile' : '/auth'} style={{
            color: 'var(--green-muted)',
            padding: 8,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
          }}>
            <User size={18} />
          </Link>

          <Link to="/cart" style={{
            position: 'relative',
            color: 'var(--cream)',
            background: 'var(--orange)',
            padding: '7px 12px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
          }}>
            <ShoppingBasket size={16} />
            {cartCount > 0 && (
              <span style={{
                background: 'white',
                color: 'var(--orange)',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Bottom nav - mobile */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid var(--cream-dark)',
        display: 'flex',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {[
          { icon: Home, label: 'Home', path: '/' },
          { icon: Store, label: 'Market', path: '/market' },
          { icon: User, label: 'Account', path: user ? '/profile' : '/auth' },
          { icon: ShoppingBasket, label: 'Cart', path: '/cart', badge: cartCount },
        ].map(({ icon: Icon, label, path, badge }) => (
          <Link key={path} to={path} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 0',
            gap: 3,
            color: isActive(path) ? 'var(--green)' : '#999',
            fontSize: 10,
            fontWeight: isActive(path) ? 600 : 400,
          }}>
            <div style={{ position: 'relative' }}>
              <Icon size={20} />
              {badge > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -7,
                  background: 'var(--orange)', color: 'white',
                  borderRadius: '50%', width: 15, height: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700,
                }}>
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
