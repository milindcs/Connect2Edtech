import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { isValidEmail } from '../../shared/authValidation'

const STORAGE_KEY = 'signin_form_data'

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
  // FIX: Destructured googleSignin from useAuth hook
  const { signin, googleSignin, isAuthenticated, user } = useAuth()

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    document.title = 'Sign In - Connect2Edtech'
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: formData.email }))
  }, [formData.email])

  // FIX: Centralized navigation rules based on your state.
  // Instead of conflicting callbacks, this now handles all role-based redirecting seamlessly.
  useEffect(() => {
    if (!isAuthenticated) return
    localStorage.removeItem(STORAGE_KEY)

    const role = user?.role
    const target = role === 'admin' ? '/admin' : role === 'hr' ? '/hr' : role === 'user' ? '/user' : '/dashboard'
    
    navigate(target, { replace: true })
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleGoogleSignin = async () => {
    setGoogleLoading(true)
    try {
      const google = window.google
      if (!google) {
        showToast('Google Sign-In is loading. Please try again.', 'error')
        setGoogleLoading(false)
        return
      }

      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: async (response) => {
          try {
            await googleSignin(response.credential)
            showToast('Signed in with Google!', 'success')
            // Navigation handled safely by the centralized useEffect hook above now
          } catch (err) {
            showToast(err.message || 'Google sign-in failed', 'error')
            setGoogleLoading(false)
          }
        },
      })

      google.accounts.id.prompt()
    } catch (err) {
      showToast('Google Sign-In is not available.', 'error')
      setGoogleLoading(false)
    }
  }

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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = formData.email.trim()
    const nextErrors = {}
    if (!isValidEmail(email)) nextErrors.email = 'Please enter a valid email address.'
    if (formData.password.trim().length === 0) nextErrors.password = 'Please enter your password.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await signin(email, formData.password)
      showToast('Signed in! Redirecting...', 'success')
      // Navigation handled safely by the centralized useEffect hook above now
    } catch (err) {
      const message = err.message || 'Could not sign in. Please try again.'
      showToast(message, 'error')
      setFormData((prev) => ({ ...prev, password: '' }))
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

          <button className="btn primary auth-submit" type="submit" disabled={isSubmitting || googleLoading}>
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="btn google-btn"
            onClick={handleGoogleSignin}
            disabled={isSubmitting || googleLoading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

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