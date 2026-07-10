import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { buildWhatsAppUrl, cleanText } from '../../shared/whatsappUtils'
import {
  validateSignup,
  passwordStrength,
  ALLOWED_ROLES,
} from '../../shared/authValidation'

const STORAGE_KEYS = {
  form: 'signup_form_data',
  whatsapp: 'signup_connect_whatsapp',
  verification: 'signup_requires_verification',
  email: 'signup_registered_email',
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'Student / Learner' },
  { value: 'hr', label: 'HR / Recruiter' },
  { value: 'admin', label: 'Admin' },
]

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

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup, verifyOtp, resendOtp, isAuthenticated, user } = useAuth()

  const [toasts, setToasts] = useState([])
  const [step, setStep] = useState('form') // 'form' | 'verify'

  const [formData, setFormData] = useState(() => {
    const saved = readJson(STORAGE_KEYS.form, null)
    return {
      name: saved?.name || '',
      email: saved?.email || '',
      phone: saved?.phone || '',
      role: ALLOWED_ROLES.includes(saved?.role) ? saved.role : 'user',
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
    }, 3000)
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
        role: formData.role,
        password: formData.password,
      })

      if (data.requiresVerification) {
        setRegisteredEmail(formData.email.trim())
        setStep('verify')
        setOtp('')
        showToast('Account created. Verification code sent to your email.', 'success')
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
      showToast('Please enter the verification code.', 'error')
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
    <div className="enroll-wrap">
      <div className="container">
        <div className="enroll-card">
          {step === 'form' ? (
            <>
              <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 8 }}>
                Create your account
              </h2>
              <p className="section-subtitle" style={{ marginBottom: 28 }}>
                Sign up to get updates and continue your journey on Connect2Edtech.
              </p>

              <form className="form-grid" onSubmit={handleSignup} noValidate aria-label="Signup form">
                <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <label>
                    <span className="field-label">Full Name</span>
                    <input
                      name="name"
                      required
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={setField}
                      autoComplete="name"
                      className={errors.name ? 'input-error' : ''}
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </label>
                  <label>
                    <span className="field-label">Phone Number</span>
                    <input
                      name="phone"
                      required
                      placeholder="+91 7019436720"
                      value={formData.phone}
                      onChange={setField}
                      autoComplete="tel"
                      className={errors.phone ? 'input-error' : ''}
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </label>
                </div>

                <label>
                  <span className="field-label">I am a</span>
                  <select name="role" value={formData.role} onChange={setField}>
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="field-label">WhatsApp Number</span>
                  <input
                    name="whatsappNumber"
                    placeholder={connectWhatsapp ? 'Same as phone (or enter another)' : '+91 7019436720'}
                    value={formData.whatsappNumber}
                    onChange={setField}
                    autoComplete="tel"
                    disabled={!connectWhatsapp}
                    className={errors.whatsappNumber ? 'input-error' : ''}
                  />
                  {errors.whatsappNumber && (
                    <span className="field-error">{errors.whatsappNumber}</span>
                  )}
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={connectWhatsapp}
                    onChange={(e) => setConnectWhatsapp(e.target.checked)}
                    style={{ width: 'auto' }}
                  />
                  Link my WhatsApp number to this email for course updates
                </label>
                <div className="hint" style={{ marginTop: -8 }}>
                  Your WhatsApp number is linked to your email so we can reach you with course updates.
                </div>

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
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </label>

                <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <label>
                    <span className="field-label">Password</span>
                    <input
                      name="password"
                      required
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={setField}
                      autoComplete="new-password"
                      className={errors.password ? 'input-error' : ''}
                    />
                    {errors.password && <span className="field-error">{errors.password}</span>}
                  </label>
                  <label>
                    <span className="field-label">Confirm Password</span>
                    <input
                      name="confirmPassword"
                      required
                      type="password"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={setField}
                      autoComplete="new-password"
                      className={errors.confirmPassword ? 'input-error' : ''}
                    />
                    {errors.confirmPassword && (
                      <span className="field-error">{errors.confirmPassword}</span>
                    )}
                  </label>
                </div>

                <div
                  style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14 }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
                    {strength.label}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }} aria-label="password strength meter">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          height: 8,
                          width: '25%',
                          borderRadius: 999,
                          background:
                            strength.score > i
                              ? 'linear-gradient(135deg, #ec4899, #db2777)'
                              : 'rgba(219, 39, 119, 0.1)',
                          border: '1px solid rgba(219, 39, 119, 0.1)',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: 6 }}>
                  <button className="btn primary" type="submit" style={{ flexGrow: 1 }} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Sign Up'}
                  </button>
                </div>

                <div className="hint" style={{ marginTop: 6 }}>
                  By signing up, you agree to be contacted about your learning journey.
                </div>

                <div className="hint" style={{ marginTop: 10 }}>
                  Already have an account?{' '}
                  <Link to="/signin" style={{ textDecoration: 'underline' }}>Sign in</Link>.
                </div>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Link to="/" className="btn secondary">← Back to Home</Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 8 }}>
                Verify your email
              </h2>
              <p className="section-subtitle" style={{ marginBottom: 28 }}>
                We sent a 6-digit code to <strong>{registeredEmail}</strong>.
              </p>

              <form className="form-grid" onSubmit={handleVerify} aria-label="Verify email form">
                <label>
                  <span className="field-label">Verification Code</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    required
                    style={{ letterSpacing: 8, textAlign: 'center', fontSize: '1.25rem' }}
                  />
                </label>

                <div className="form-actions" style={{ marginTop: 6 }}>
                  <button className="btn primary" type="submit" style={{ flexGrow: 1 }} disabled={isVerifying}>
                    {isVerifying ? 'Verifying…' : 'Verify Email'}
                  </button>
                  <button type="button" className="btn secondary" onClick={handleResend} disabled={isResending} style={{ flexGrow: 1 }}>
                    {isResending ? 'Resending…' : 'Resend Code'}
                  </button>
                </div>

                <div className="hint" style={{ marginTop: 10 }}>
                  Wrong email?{' '}
                  <button
                    type="button"
                    onClick={goToForm}
                    style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Change email
                  </button>
                </div>
              </form>
            </>
          )}
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
