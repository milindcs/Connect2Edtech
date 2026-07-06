import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../../shared/cartApi'
import { buildWhatsAppUrl, cleanText } from '../../shared/whatsappUtils'

export default function EnrollmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    document.title = 'Enrollment - Connect2Edtech'
    const params = new URLSearchParams(window.location.search)
    const courseParam = params.get('course')
    if (courseParam) {
      const normalized = courseParam.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      setFormData((prev) => ({ ...prev, message: `Interested in: ${normalized}` }))
    }
  }, [])


  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const name = formData.name.trim()
    const email = formData.email.trim()
    const phone = formData.phone.trim()
    const digits = phone.replace(/\D/g, '')
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error')
      return
    }
    if (digits.length < 10 || digits.length > 15) {
      showToast('Please enter a valid phone number.', 'error')
      return
    }

    const msgParts = [
      'Hello Connect2Edtech! (New Enrollment Submission)',
      `Name: ${cleanText(name)}`,
      `Email: ${cleanText(email)}`,
      `Phone: ${cleanText(phone)}`,
      formData.message ? `Requirements: ${cleanText(formData.message)}` : null
    ].filter(Boolean)

    let whatsappUrl = buildWhatsAppUrl(msgParts.join('\n'))

    try {
      const res = await fetch(API_BASE + '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: formData.message,
          courses: 'Enrollment inquiry',
        })
      })
      const data = await res.json().catch(() => ({}))
      if (data.whatsappUrl) {
        whatsappUrl = data.whatsappUrl
      }
      showToast('Enrollment submitted! Connecting to support on WhatsApp...', 'success')
    } catch (err) {
      console.error(err)
      showToast('Opening WhatsApp...', 'success')
    }

    setIsSubmitted(true)
    setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }, 800)
  }

  if (isSubmitted) {
    return (
      <div className="enroll-wrap">
        <div className="container">
          <div className="enroll-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: 20 }}>✓</div>
            <h2 className="section-title">Enrollment Submitted!</h2>
            <p className="section-subtitle">
              Your enrollment details have been captured. We are redirecting you to WhatsApp to confirm your schedule with our onboarding coordinator.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32 }}>
              <Link to="/courses" className="btn secondary">
                Browse More Courses
              </Link>
              <a 
                href={buildWhatsAppUrl('Hi, I just submitted my enrollment on Connect2Edtech!')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn primary"
              >
                Open WhatsApp Manually
              </a>
            </div>
          </div>
        </div>

        {/* Toast Overlay */}
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

  return (
    <div className="enroll-wrap">
      <div className="container">
        <div className="enroll-card">
          <h2 className="section-title">Course Enrollment Form</h2>
          <p className="section-subtitle">
            Submit your contact information to enroll in your desired courses.
          </p>

          <div className="two-col">
            <section aria-label="Enrollment Information">
              <h2 className="summary-title">How Enrollment Works</h2>
              <div style={{ padding: '20px 0' }}>
                <p className="hint" style={{ marginBottom: 16 }}>
                  Fill out the enrollment form with your contact details and course interests. Our team will contact you to complete the enrollment process.
                </p>
                <Link to="/courses" className="btn secondary" style={{ width: '100%', marginTop: 12, textAlign: 'center' }}>
                  Browse Available Courses
                </Link>
              </div>
            </section>

            <section aria-label="Enrollment Form">
              <form id="enrollForm" className="form-grid" onSubmit={handleSubmit}>
                <label>
                  <span className="field-label">Full Name</span>
                  <input
                    id="enrollName"
                    name="name"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  <span className="field-label">Email Address</span>
                  <input
                    id="enrollEmail"
                    name="email"
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  <span className="field-label">Phone Number</span>
                  <input
                    id="enrollPhone"
                    name="phone"
                    required
                    type="tel"
                    placeholder="+91 7019436720"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  <span className="field-label">Message / Requirements (optional)</span>
                  <textarea
                    id="enrollMessage"
                    name="message"
                    rows={4}
                    placeholder="Share any background or specific learning requirements..."
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </label>

                <div className="form-actions">
                  <button type="submit" className="btn primary" style={{ flexGrow: 1 }}>
                    Submit Enrollment
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>

      {/* Toast Overlay */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast show ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link to="/" className="btn secondary">← Back to Home</Link>
      </div>
    </div>
  )
}
