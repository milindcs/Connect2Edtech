import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('') // '', 'sending', 'success', 'error'
  const [msg, setMsg] = useState('')

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || !String(email).trim()) {
      setStatus('error')
      setMsg('Please enter your email address.')
      return
    }
    setStatus('sending')
    setMsg('')
    try {
      const fd = new FormData()
      fd.append('email', email.trim())
      fd.append('_subject', 'New newsletter subscription')
      const res = await fetch('https://formsubmit.co/hr@connect2future.com', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd,
      })
      if (!res.ok) throw new Error('failed')
      setStatus('success')
      setMsg("Thanks for subscribing! We'll be in touch.")
      setEmail('')
    } catch {
      setStatus('error')
      setMsg('Subscription failed. Please try again later.')
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3>Connect2Edtech</h3>
          <p>Empowering Students with Industry-Ready Skills. Learn Today. Lead Tomorrow.</p>
          <ul className="contact-info">
            <li>📞 +91 7019426720</li>
            <li>📞 +91 7019045849</li>
            <li>
              <a href="mailto:hr@connect2future.com">✉️ hr@connect2future.com</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/courses">Courses</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for the latest course updates.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
          {msg && (
            <p
              style={{
                marginTop: 8,
                fontSize: '0.85rem',
                color: status === 'success' ? '#16a34a' : 'var(--error)',
              }}
            >
              {msg}
            </p>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Connect2Edtech. All rights reserved.</p>
      </div>
    </footer>
  )
}

