import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/enrollment', label: 'Enroll' },
  { to: '/signup', label: 'Sign Up' },
  { to: '/contact', label: 'Contact' },
]


export default function NavBar({ pathname }) {

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

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
          </nav>
        </div>
      </div>
    </header>
  )
}
