import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/certifications', label: 'Certifications' },
  { to: '/enrollment', label: 'Enroll' },
  { to: '/checkout', label: 'Checkout' },
  { to: '/verify-certificate', label: 'Verify' },
  { to: '/receive-certificate', label: 'Get Certificate' },
  { to: '/signup', label: 'Sign Up' },
  { to: '/contact', label: 'Contact' },
]


export default function NavBar({ pathname }) {

  const [isOpen, setIsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const updateCartCount = async () => {
    // Cart is server-backed; fetch current count.
    try {
      // Lazy-load to avoid circular deps during module init
      const { cartList } = await import('../../shared/cartApi.js')
      const res = await cartList()
      const items = Array.isArray(res?.items) ? res.items : []
      setCartCount(items.length)
    } catch {
      setCartCount(0)
    }
  }


  useEffect(() => {
    setIsOpen(false)
    updateCartCount()
  }, [pathname])

  useEffect(() => {
    updateCartCount()
    window.addEventListener('storage', updateCartCount)
    window.addEventListener('cart-updated', updateCartCount)
    
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cart-updated', updateCartCount)
    }
  }, [])

  return (
    <header className="site-header">
      <div className="container">
        <div className="navbar">
          <Link to="/" className="brand" aria-label="Connect2Edtech Home">
            <img src="/assets/logo.PNG" alt="Connect2Edtech Logo" className="logo" />
          </Link>


          <button
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
          >
            <span className="nav-toggle-bar"></span>
            <span className="nav-toggle-bar"></span>
            <span className="nav-toggle-bar"></span>
          </button>

          <nav className={`nav-links ${isOpen ? 'is-open' : ''}`}>
            {navItems.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className={pathname === it.to ? 'active' : ''}
              >
                {it.label}
              </Link>
            ))}
            <Link to="/cart" className="cart-nav-link">
              🛒 Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
