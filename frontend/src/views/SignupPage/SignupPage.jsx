import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { buildWhatsAppUrl, cleanText } from '../../shared/whatsappUtils'
import {
  validateSignup,
  passwordStrength,
} from '../../shared/authValidation'

const STORAGE_KEYS = {
  form: 'signup_form_data',
  whatsapp: 'signup_connect_whatsapp',
  verification: 'signup_requires_verification',
  email: 'signup_registered_email',
}

function dashboardForRole(role) {
  return role === 'admin' ? '/admin' : role === 'hr' ? '/hr' : '/student'
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
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
  const { signup, verifyOtp, resendOtp, isAuthenticated, user } = useAuth()

  const [toasts, setToasts] = useState([])
  const [step, setStep] = useState('form')

  const [formData, setFormData] = useState(() => {
    const saved = readJson(STORAGE_KEYS.form, null)
    return {
      name: saved?.name || '',
      email: saved?.email || '',
      phone: saved?.phone || '',
      whatsappNumber: saved?.whatsappNumber || '',
      password: '',
      confirmPassword: '',
    }
  })

  const [connectWhatsapp, setConnectWhatsapp] = useState(
    readJson(STORAGE_KEYS.whatsapp, true)
  )

  const [registeredEmail, setRegisteredEmail] = useState(
    localStorage.getItem(STORAGE_KEYS.email) || ''
  )

  const [errors, setErrors] = useState({})
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    document.title = 'Sign Up - Connect2Edtech'
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      clearSignupStorage()
      navigate(dashboardForRole(user?.role))
    }
  }, [isAuthenticated, navigate, user?.role])

  useEffect(() => {
    const { password, confirmPassword, ...rest } = formData
    localStorage.setItem(STORAGE_KEYS.form, JSON.stringify(rest))
  }, [formData])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.whatsapp, JSON.stringify(connectWhatsapp))
  }, [connectWhatsapp])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.verification, JSON.stringify(step === 'verify'))
  }, [step])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.email, registeredEmail)
  }, [registeredEmail])

  function clearSignupStorage() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
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

  const strength = useMemo(
    () => passwordStrength(formData.password),
    [formData.password]
  )

  const handleSignup = async (e) => {
    e.preventDefault()
    const validation = validateSignup({
      ...formData,
      connectWhatsapp,
    })
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      showToast('Please fix the highlighted fields.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        whatsappNumber: connectWhatsapp
          ? (formData.whatsappNumber.trim() || formData.phone.trim())
          : '',
        connectWhatsapp,
        password: formData.password,
      })

      if (data.requiresVerification) {
        setRegisteredEmail(formData.email.trim())
        setStep('verify')
        setOtp('')
        showToast('Account created! Check your email for the verification code.', 'success')
        const msg = [
          'Hello Connect2Edtech! I just signed up.',
          `Name: ${cleanText(formData.name)}`,
          `Email: ${cleanText(formData.email)}`,
        ].join('\n')
        setTimeout(() => {
          window.open(buildWhatsAppUrl(msg), '_blank', 'noopener,noreferrer')
        }, 800)
      }
    } catch (err) {
      showToast(err.message || 'Signup failed. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!otp || otp.length < 4) {
      showToast('Please enter the 6-digit verification code.', 'error')
      return
    }
    setIsVerifying(true)
    try {
      await verifyOtp(registeredEmail, otp, { autoLogin: false })
      showToast('Email verified! Please sign in to continue.', 'success')
      clearSignupStorage()
      setTimeout(() => navigate('/signin'), 800)
    } catch (err) {
      showToast(err.message || 'Verification failed.', 'error')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!registeredEmail) return
    setIsResending(true)
    try {
      await resendOtp(registeredEmail)
      showToast('New verification code sent to your email.', 'success')
    } catch (err) {
      showToast(err.message || 'Could not resend code.', 'error')
    } finally {
      setIsResending(false)
    }
  }

  const goToForm = () => {
    setStep('form')
    setOtp('')
    setErrors({})
    clearSignupStorage()
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {step === 'form' ? (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join Connect2Edtech and start learning today.</p>
            </div>

            <form className="auth-form" onSubmit={handleSignup} noValidate aria-label="Signup form">
              <div className="form-row">
                <div className="field">
                  <label className="field-label" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={setField}
                    autoComplete="name"
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    required
                    placeholder="+91 7019436720"
                    value={formData.phone}
                    onChange={setField}
                    autoComplete="tel"
                    className={errors.phone ? 'input-error' : ''}
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
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

              <div className="form-row">
                <PasswordInput
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={setField}
                  placeholder="Min 4 characters"
                  error={errors.password}
                  autoComplete="new-password"
                />
                <PasswordInput
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={setField}
                  placeholder="Re-enter password"
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />
              </div>

              <div className="strength-card">
                <div className="strength-header">
                  <span className="strength-label">{strength.label}</span>
                </div>
                <div className="strength-bar" aria-label="password strength meter">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`strength-segment ${strength.score > i ? 'is-filled' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <label className="checkbox-card">
                <input
                  type="checkbox"
                  checked={connectWhatsapp}
                  onChange={(e) => setConnectWhatsapp(e.target.checked)}
                />
                <span>
                  <strong>Link WhatsApp for updates</strong>
                  <span className="hint">Get course updates and support directly on WhatsApp.</span>
                </span>
              </label>

              <div className="field">
                <label className="field-label" htmlFor="whatsappNumber">WhatsApp Number</label>
                <input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  placeholder={connectWhatsapp ? 'Same as phone (or enter another)' : 'Optional'}
                  value={formData.whatsappNumber}
                  onChange={setField}
                  autoComplete="tel"
                  disabled={!connectWhatsapp}
                  className={errors.whatsappNumber ? 'input-error' : ''}
                />
                {errors.whatsappNumber && (
                  <span className="field-error">{errors.whatsappNumber}</span>
                )}
              </div>

              <button className="btn primary auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Sign Up'}
              </button>

              <p className="auth-footer">
                Already have an account? <Link to="/signin">Sign in</Link>.
              </p>
            </form>
          </>
        ) : (
          <>
            <div className="auth-header">
              <div className="auth-icon">📩</div>
              <h1 className="auth-title">Verify your email</h1>
              <p className="auth-subtitle">
                We sent a 6-digit code to <strong>{registeredEmail}</strong>.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleVerify} aria-label="Verify email form">
              <div className="field">
                <label className="field-label" htmlFor="otp">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  required
                  className="otp-input"
                />
              </div>

              <div className="form-actions">
                <button className="btn primary auth-submit" type="submit" disabled={isVerifying}>
                  {isVerifying ? 'Verifying…' : 'Verify Email'}
                </button>
                <button type="button" className="btn secondary auth-submit" onClick={handleResend} disabled={isResending}>
                  {isResending ? 'Resending…' : 'Resend Code'}
                </button>
              </div>

              <p className="auth-footer">
                Wrong email?{' '}
                <button
                  type="button"
                  onClick={goToForm}
                  className="link-button"
                >
                  Change email
                </button>
              </p>
            </form>
          </>
        )}
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
