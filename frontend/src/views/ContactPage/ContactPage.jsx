import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../shared/api'
import { buildWhatsAppUrl } from '../../shared/whatsappUtils'

export default function ContactPage() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('contact_form_data')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return { name: '', email: '', phone: '', message: '' }
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    document.title = 'Contact Us | Connect2Edtech'

    const sections = document.querySelectorAll('.animate-on-scroll')
    if (!('IntersectionObserver' in window)) {
      sections.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      localStorage.setItem('contact_form_data', JSON.stringify(next))
      return next
    })
  }

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await api.post('/api/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        courses: '',
      })
      showToast('Inquiry captured! We will get back to you soon.', 'success')
      localStorage.removeItem('contact_form_data')
      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Could not submit inquiry. Please try again.', 'error')
    }
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <section className="detail-hero animate-on-scroll animate-fade-up" style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: 12 }}>Contact Our Team</h1>
        <p className="section-subtitle">
          Have questions about college partnerships, on-campus training, certifications, or placement support? We are here to help.
        </p>
      </section>

      {isSubmitted ? (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '4.5rem', color: 'var(--success)', marginBottom: 20 }}>✓</div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Message Sent Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
            We've recorded your inquiry. Redirecting to WhatsApp so you can chat directly with our advisor.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/courses" className="btn secondary">
                Browse Courses
              </Link>
            <a
              href={buildWhatsAppUrl('Hi, I just submitted my contact inquiry on Connect2Edtech!')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn primary"
            >
              Start Chat Manually
            </a>
          </div>
        </div>
      ) : (
        <div className="contact-wrapper">
          <div className="card contact-form-card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Send Us a Message</h2>

            <form id="contactForm" onSubmit={handleSubmit} className="form-grid">
              <label>
                <span className="field-label">Full Name</span>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                <span className="field-label">Email Address</span>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                <span className="field-label">Phone Number</span>
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="+91 7019426720"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                <span className="field-label">Message</span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  placeholder="How can we assist you today? Ask about schedules, custom corporate modules, or internships..."
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </label>

              <div className="form-actions">
                <button className="btn primary" type="submit" style={{ flexGrow: 1 }}>
                  Send Message via WhatsApp
                </button>
              </div>
            </form>
          </div>

          <div className="card contact-info" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Contact Information</h2>

            <div className="info-item">
              <span style={{ fontSize: '1.4rem' }}>📞</span>
              <div>
                <p style={{ fontWeight: 600 }}>Phone Number</p>
                <a href="tel:+917019426720" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>+91 7019426720</a>
                <br />
                <a href="tel:+917019045849" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>+91 7019045849</a>
              </div>
            </div>

            <div className="info-item">
              <span style={{ fontSize: '1.4rem' }}>✉️</span>
              <div>
                <p style={{ fontWeight: 600 }}>Email Address</p>
                <a href="mailto:hr@connect2future.com" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>hr@connect2future.com</a>
              </div>
            </div>

            <div className="info-item">
              <span style={{ fontSize: '1.4rem' }}>📍</span>
              <div>
                <p style={{ fontWeight: 600 }}>Head Office Location</p>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Mysuru, Karnataka, India</span>
              </div>
            </div>

            <div className="info-item">
              <span style={{ fontSize: '1.4rem' }}>💬</span>
              <div>
                <p style={{ fontWeight: 600 }}>WhatsApp Assistance</p>
                <a
                  href={buildWhatsAppUrl('Hi, I need help with Connect2Edtech courses and enrollment!')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#25D366', fontWeight: 700 }}
                >
                  Chat with Onboarding Advisor
                </a>
              </div>
            </div>

            <div className="support-box" style={{ marginTop: 'auto' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>How We Can Help:</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>College Partnership Inquiries</li>
                <li>On-Campus Training Scheduling</li>
                <li>Real Project Collaboration</li>
                <li>Certification & Placement Support</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert overlay */}
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
