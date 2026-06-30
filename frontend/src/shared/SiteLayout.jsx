import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import WhatsAppCTA from './components/WhatsAppCTA'

export default function SiteLayout({ children }) {
  const location = useLocation()

  return (
    <div>
      <NavBar pathname={location.pathname} />
      <main>{children}</main>
      <Footer />
      <WhatsAppCTA />
    </div>
  )
}

