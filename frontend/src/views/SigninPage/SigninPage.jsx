import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { isValidEmail } from '../../shared/authValidation'

const STORAGE_KEY = 'signin_form_data'

function dashboardForRole(role) {
  return role === 'admin' ? '/admin' : role === 'hr' ? '/hr' : '/student'
}

function PasswordInput({ label, name, value, onChange, placeholder, error, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="field">
      <label className="field-label" htmlFor={name}>{label}</label>
      <div className="input-wrapper">
        <input
          id={name}
          name={name}
          required
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={error ? 'input-error' : ''}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default function SigninPage() {
  const navigate = useNavigate()
  const { signin, isAuthenticated, user, resendOtp } = useAuth()

  const [toasts, setToasts] = useState([])
  const [formData, setFormData] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      return { email: parsed.email || '', password: '' }
    } catch {
      return { email: '', password: '' }
    }
  })

  const [errors, setErrors] = useState({})
  const [showResend, setShowResend] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    document.title = 'Sign In - Connect2Edtech'
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: formData.email }))
  }, [formData.email])

  useEffect(() => {
    if (!isAuthenticated) return
    localStorage.removeItem(STORAGE_KEY)
    navigate(dashboardForRole(user?.role))
  }, [isAuthenticated, user?.role, navigate])

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const setField = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    if (showResend && name === 'email') {
      setResendEmail(value)
      setShowResend(false)
    }
  }

  const handleResend = async () => {
    const email = resendEmail || formData.email.trim()
    if (!email) return
    setIsResending(true)
    try {
      await resendOtp(email)
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
    const nextErrors = {}
    if (!isValidEmail(email)) nextErrors.email = 'Please enter a valid email address.'
    if (!formData.password) nextErrors.password = 'Please enter your password.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await signin(email, formData.password)
      showToast('Signed in! Redirecting...', 'success')
    } catch (err) {
      const message = err.message || 'Could not sign in. Please try again.'
      showToast(message, 'error')
      if (message.toLowerCase().includes('verify')) {
        setResendEmail(email)
        setShowResend(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your learning journey.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate aria-label="Sign in form">
          <div className="field">
            <label className="field-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              required
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={setField}
              autoComplete="email"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={setField}
            placeholder="Enter your password"
            error={errors.password}
            autoComplete="current-password"
          />

          <button className="btn primary auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>

          {showResend && (
            <div className="resend-card">
              <p className="resend-text">
                📩 Your email isn't verified yet. Didn't receive the code?
              </p>
              <button type="button" className="btn secondary auth-submit" onClick={handleResend} disabled={isResending}>
                {isResending ? 'Resending…' : 'Resend Verification Code'}
              </button>
            </div>
          )}

          <p className="auth-footer">
            New here? <Link to="/signup">Create an account</Link>.
          </p>
        </form>
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
