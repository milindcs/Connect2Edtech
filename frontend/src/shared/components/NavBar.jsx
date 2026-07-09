import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'

export default function NavBar({ pathname }) {
  const { user, isAuthenticated, isAdmin, signout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/courses', label: 'Courses' },
    { to: '/enrollment', label: 'Enroll' },
    { to: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <header className="site-header">
      <div className="container">
        <div className="navbar">
          <Link to="/" className="brand" aria-label="Connect2Edtech Home">
            <img src="/assets/logo.PNG" alt="Connect2Edtech Logo" className="logo" />
          </Link>

          <button className="nav-toggle" aria-label="Toggle navigation" aria-expanded={isOpen} onClick={() => setIsOpen((v) => !v)}>
            <span className="nav-toggle-bar"></span>
            <span className="nav-toggle-bar"></span>
            <span className="nav-toggle-bar"></span>
          </button>

          <nav className={`nav-links ${isOpen ? 'is-open' : ''}`}>
            {navItems.map((it) => (
              <Link key={it.to} to={it.to} className={pathname === it.to ? 'active' : ''}>
                {it.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className={pathname === '/admin' ? 'active' : ''}>Admin Dashboard</Link>
                )}
                <span style={{ fontSize: '0.9rem', color: '#831843' }}>{user?.name}</span>
                <button onClick={signout} className="btn secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/signup" className={pathname === '/signup' ? 'active' : ''}>Sign Up</Link>
                <Link to="/signin" className={pathname === '/signin' ? 'active' : ''}>Sign In</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
