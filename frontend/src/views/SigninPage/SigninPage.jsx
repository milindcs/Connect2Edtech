import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'

export default function SigninPage() {
  const navigate = useNavigate()
  const { signin, isAuthenticated, isAdmin, user, resendOtp } = useAuth()
  const [toasts, setToasts] = useState([])
  const [showResend, setShowResend] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  
  // Initialize state from local storage or fallback to empty values
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('signin_form_data')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Secure choice: Don't persist passwords across browser sessions
        return { email: parsed.email || '', password: '' }
      } catch (e) {
        // Fallback if parsing fails
      }
    }
    return { email: '', password: '' }
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Sign In - Connect2Edtech'
  }, [])

  // Sync form modifications to localStorage
  useEffect(() => {
    localStorage.setItem('signin_form_data', JSON.stringify({ email: formData.email }))
  }, [formData.email])

  useEffect(() => {
    if (!isAuthenticated) return
    const role = user?.role
    const target = role === 'admin' ? '/admin' : role === 'hr' ? '/hr' : '/student'
    localStorage.removeItem('signin_form_data') // Clear on successful login
    navigate(target)
  }, [isAuthenticated, user?.role, navigate])

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

  const handleResend = async () => {
    if (!resendEmail) return
    setIsResending(true)
    try {
      await resendOtp(resendEmail)
      showToast('New verification code sent to your email.', 'success')
      setShowResend(false)
    } catch (err) {
      showToast(err.message || 'Could not resend code.', 'error')
    } finally {
      setIsResending(false)
    }
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
    try {
      await signin(email, password)
      showToast('Signed in! Redirecting...', 'success')
    } catch (err) {
      showToast(err.message || 'Could not sign in. Please try again.', 'error')
      if (err.message?.includes('verify your email')) {
        setResendEmail(email)
        setShowResend(true)
      }
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
              <input name="email" required type="email" placeholder="you@example.com" value={formData.email} onChange={setField} autoComplete="email" />
            </label>

            <label>
              <span className="field-label">Password</span>
              <input name="password" required type="password" placeholder="Enter your password" value={formData.password} onChange={setField} autoComplete="current-password" />
            </label>

            <div className="form-actions" style={{ marginTop: 6 }}>
              <button className="btn primary" type="submit" style={{ flexGrow: 1 }} disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </button>
              <Link to="/signup" className="btn secondary" style={{ textAlign: 'center' }}>
                Create account
              </Link>
            </div>

            {showResend && (
              <div style={{ marginTop: 16, padding: 16, background: 'rgba(236, 72, 153, 0.05)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                <p style={{ marginBottom: 8, fontSize: '0.9rem' }}>Didn't receive the code? Resend verification email.</p>
                <button type="button" className="btn secondary" onClick={handleResend} disabled={isResending} style={{ flexGrow: 1 }}>
                  {isResending ? 'Resending…' : 'Resend Verification Code'}
                </button>
              </div>
            )}

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
