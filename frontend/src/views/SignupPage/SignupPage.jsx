import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buildWhatsAppUrl, cleanText } from '../../shared/whatsappUtils'
import { API_BASE } from '../../shared/cartApi'

export default function SignupPage() {
  const navigate = useNavigate()
  const [toasts, setToasts] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Sign Up - Connect2Edtech'
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

  const passwordStrength = useMemo(() => {
    const p = formData.password || ''
    let score = 0
    if (p.length >= 8) score += 1
    if (/[A-Z]/.test(p)) score += 1
    if (/[0-9]/.test(p)) score += 1
    if (/[^A-Za-z0-9]/.test(p)) score += 1
    return score
  }, [formData.password])

  const passwordHint = useMemo(() => {
    if (!formData.password) return 'Use at least 8 characters.'
    if (passwordStrength <= 1) return 'Add uppercase, numbers, or symbols to strengthen.'
    if (passwordStrength === 2) return 'Good start—consider adding a symbol.'
    if (passwordStrength >= 3) return 'Strong password.'
    return 'Good.'
  }, [formData.password, passwordStrength])

  const validate = () => {
    const name = formData.name.trim()
    const email = formData.email.trim()
    const phone = formData.phone.trim()
    const password = formData.password
    const confirmPassword = formData.confirmPassword

    if (name.length < 2) return 'Please enter your full name.'

    // Lightweight email check
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.'

    // Basic phone check (10-15 digits)
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) return 'Please enter a valid phone number.'

    if (password.length < 8) return 'Password must be at least 8 characters.'

    if (password !== confirmPassword) return 'Passwords do not match.'

    return null
  }

const handleSubmit = async (e) => {
    e.preventDefault()

    const err = validate()
    if (err) {
      showToast(err, 'error')
      return
    }

    setIsSubmitting(true)

    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim()
    }

    const fallbackMsg = [
      'Hello Connect2Edtech! (New Signup)',
      `Name: ${cleanText(payload.name)}`,
      `Email: ${cleanText(payload.email)}`,
      `Phone: ${cleanText(payload.phone)}`
    ].filter(Boolean).join('\n')

    const fallbackWhatsappUrl = buildWhatsAppUrl(fallbackMsg)

    try {
      const res = await fetch(API_BASE + '/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          password: payload.password,
        })
      })

      const data = await res.json().catch(() => ({}))
      if (!data.ok) {
        throw new Error(data.error || 'Signup submission failed')
      }

      const whatsappUrl = data.whatsappUrl || fallbackWhatsappUrl
      showToast('Details captured! Redirecting to WhatsApp...', 'success')
      setTimeout(() => {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
        navigate('/')
      }, 800)
    } catch (err) {
      // A network/connection failure means the server is unreachable, so fall
      // back to opening WhatsApp directly instead of losing the lead.
      const isNetworkError = err instanceof TypeError || /Failed to fetch|NetworkError|network/i.test(err.message || '')
      if (isNetworkError) {
        window.open(fallbackWhatsappUrl, '_blank', 'noopener,noreferrer')
        showToast('Could not reach the server. We opened WhatsApp so you can still register.', 'error')
      } else {
        showToast(err.message || 'Could not save signup details. Please try again.', 'error')
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
            Create your account
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 28 }}>
            Sign up to get updates and continue your journey on Connect2Edtech.
          </p>

          <form className="form-grid" onSubmit={handleSubmit} aria-label="Signup form">
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
                />
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
                />
              </label>
            </div>

            <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
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

<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                 <span className="field-label">Password Strength</span>
                 <div
                   style={{
                     background: 'rgba(0, 255, 0, 0.05)',
                     border: '1px solid var(--border-color)',
                     borderRadius: 12,
                     padding: 14
                   }}
                 >
                   <div style={{ fontWeight: 700, marginBottom: 6, color: '#000000' }}>{passwordHint}</div>
                   <div style={{ display: 'flex', gap: 8 }} aria-label="password strength meter">
                     {[0, 1, 2, 3].map((i) => (
                       <div
                         key={i}
                         style={{
                           height: 8,
                           width: '25%',
                           borderRadius: 999,
                           background:
                             passwordStrength > i
                               ? 'linear-gradient(135deg, #000000, #000000)'
                               : 'rgba(0, 0, 0, 0.1)',
                           border: '1px solid rgba(0, 0, 0, 0.1)'
                         }}
                       />
                     ))}
                   </div>
                 </div>
               </div>
            </div>

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
                />
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
                />
              </label>
            </div>

            <div className="form-actions" style={{ marginTop: 6 }}>
              <button className="btn primary" type="submit" style={{ flexGrow: 1 }} disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Sign Up'}
              </button>
              <Link to="/contact" className="btn secondary" style={{ textAlign: 'center' }}>
                Need help?
              </Link>
            </div>

            <div className="hint" style={{ marginTop: 6 }}>
              By signing up, you agree to be contacted about your learning journey.
            </div>

             <div className="hint" style={{ marginTop: 10 }}>
                Already have an account? <Link to="/signin">Sign in</Link>.
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

