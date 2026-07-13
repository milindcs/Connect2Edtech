import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { validateSignup, passwordStrength } from '../../shared/authValidation'

function dashboardForRole(role) {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'hr':
      return '/hr'
    case 'student':
      return '/student'
    default:
      return '/student'
  }
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

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup, isAuthenticated, user, signin } = useAuth()

  const [toasts, setToasts] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    whatsappNumber: '',
    connectWhatsapp: false,
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [strength, setStrength] = useState(passwordStrength(''))

  useEffect(() => {
    document.title = 'Sign Up - Connect2Edtech'
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
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
    const { name, value, type, checked } = e.target
    const nextValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: nextValue }))
    if (name === 'password') setStrength(passwordStrength(value))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      ...formData,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      whatsappNumber: formData.whatsappNumber.trim(),
    }

    const nextErrors = validateSignup(payload)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await signup(payload)
      showToast('Account created! Redirecting to sign in…', 'success')
      navigate('/signin')
    } catch (err) {
      const message = err.message || 'Could not create your account. Please try again.'
      showToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const { score, label } = strength

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join Connect2Edtech and start your learning journey.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate aria-label="Sign up form">
          <div className="field">
            <label className="field-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              required
              placeholder="Jane Doe"
              value={formData.name}
              onChange={setField}
              autoComplete="name"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

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

          <div className="field">
            <label className="field-label" htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              required
              placeholder="9876543210"
              value={formData.phone}
              onChange={setField}
              autoComplete="tel"
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={setField}
            placeholder="Create a password"
            error={errors.password}
            autoComplete="new-password"
          />

          {formData.password && (
            <div className="strength-card">
              <div className="strength-header">
                <span className="strength-label">Password strength</span>
                <span className="field-error" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                  {' '}{label}
                </span>
              </div>
              <div className="strength-bar">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`strength-segment${i < score ? ' is-filled' : ''}`}
                  />
                ))}
              </div>
            </div>
          )}

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={setField}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <label className="checkbox-card">
            <input
              type="checkbox"
              name="connectWhatsapp"
              checked={formData.connectWhatsapp}
              onChange={setField}
            />
            <span>
              Connect a WhatsApp number for updates
              <span className="hint">Leave unchecked to use your phone number above.</span>
            </span>
          </label>

          {formData.connectWhatsapp && (
            <div className="field">
              <label className="field-label" htmlFor="whatsappNumber">WhatsApp Number</label>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                placeholder="9876543210"
                value={formData.whatsappNumber}
                onChange={setField}
                autoComplete="tel"
                className={errors.whatsappNumber ? 'input-error' : ''}
              />
              {errors.whatsappNumber && (
                <span className="field-error">{errors.whatsappNumber}</span>
              )}
            </div>
          )}

          <button className="btn primary auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Creating Account…
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/signin">Sign in</Link>.
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
