import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { isValidEmail } from '../../shared/authValidation'

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

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { verifyOtp, resendOtp } = useAuth()

  const emailFromQuery = searchParams.get('email') || ''
  const devOtp = searchParams.get('devOtp') || ''

  const [email, setEmail] = useState(emailFromQuery)
  const [otp, setOtp] = useState('')
  const [toasts, setToasts] = useState([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    document.title = 'Verify Email - Connect2Edtech'
  }, [])

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanEmail = email.trim()
    if (!isValidEmail(cleanEmail)) {
      showToast('Please enter a valid email address.', 'error')
      return
    }
    if (!otp.trim()) {
      showToast('Please enter the verification code.', 'error')
      return
    }

    setIsVerifying(true)
    try {
      const data = await verifyOtp(cleanEmail, otp.trim())
      showToast('Email verified! Redirecting…', 'success')
      const role = data?.user?.role || 'user'
      setTimeout(() => navigate(dashboardForRole(role)), 600)
    } catch (err) {
      showToast(err.message || 'Verification failed. Please try again.', 'error')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    const cleanEmail = email.trim()
    if (!isValidEmail(cleanEmail)) {
      showToast('Please enter a valid email address.', 'error')
      return
    }
    setIsResending(true)
    try {
      await resendOtp(cleanEmail)
      showToast('A new verification code has been sent to your email.', 'success')
    } catch (err) {
      showToast(err.message || 'Could not resend code.', 'error')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Verify your email</h1>
          <p className="auth-subtitle">
            We sent a 6-digit code to your inbox. Enter it below to finish setting up your account.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate aria-label="Verify email form">
          <div className="field">
            <label className="field-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              required
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="otp">Verification Code</label>
            <input
              id="otp"
              name="otp"
              required
              inputMode="numeric"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoComplete="one-time-code"
              className="otp-input"
            />
          </div>

          {devOtp && (
            <div className="dev-otp-hint">
              Dev mode — your code is <strong>{devOtp}</strong>
            </div>
          )}

          <button className="btn primary auth-submit" type="submit" disabled={isVerifying}>
            {isVerifying ? (
              <>
                <span className="spinner"></span>
                Verifying…
              </>
            ) : (
              'Verify Email'
            )}
          </button>

          <div className="resend-card">
            <p className="resend-text">Didn't receive the code?</p>
            <button
              type="button"
              className="btn secondary auth-submit"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? 'Resending…' : 'Resend Verification Code'}
            </button>
          </div>

          <p className="auth-footer">
            Back to <Link to="/signin">Sign in</Link>.
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
