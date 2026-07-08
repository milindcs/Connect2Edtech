import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../../shared/cartApi'

export default function SigninPage() {
  const navigate = useNavigate()
  const [toasts, setToasts] = useState([])
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Sign In - Connect2Edtech'
  }, [])

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const setField = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = formData.email.trim()
    const password = formData.password

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error')
      return
    }
    if (!password) {
      showToast('Please enter your password.', 'error')
      return
    }

    setIsSubmitting(true)
    let whatsappUrl = ''
    try {
      const res = await fetch(API_BASE + '/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json().catch(() => ({}))
      if (!data.ok) {
        throw new Error(data.error || 'Sign in failed')
      }
      if (data.whatsappUrl) {
        whatsappUrl = data.whatsappUrl
      }
      showToast('Signed in! Redirecting...', 'success')
      setTimeout(() => {
        if (whatsappUrl) {
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
        }
        navigate('/')
      }, 800)
    } catch (err) {
      showToast(err.message || 'Could not sign in. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="enroll-wrap">
      <div className="container">
        <div className="enroll-card">
          <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 8 }}>
            Welcome back
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 28 }}>
            Sign in to continue your journey on Connect2Edtech.
          </p>

          <form className="form-grid" onSubmit={handleSubmit} aria-label="Sign in form">
            <label>
              <span className="field-label">Email Address</span>
              <input
                name="email"
                required
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={setField}
                autoComplete="email"
              />
            </label>

            <label>
              <span className="field-label">Password</span>
              <input
                name="password"
                required
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={setField}
                autoComplete="current-password"
              />
            </label>

            <div className="form-actions" style={{ marginTop: 6 }}>
              <button className="btn primary" type="submit" style={{ flexGrow: 1 }} disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </button>
              <Link to="/signup" className="btn secondary" style={{ textAlign: 'center' }}>
                Create account
              </Link>
            </div>

            <div className="hint" style={{ marginTop: 6 }}>
              New here? <Link to="/signup">Sign up</Link> to create an account.
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link to="/" className="btn secondary">← Back to Home</Link>
            </div>
          </form>
        </div>
      </div>

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast show ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}
