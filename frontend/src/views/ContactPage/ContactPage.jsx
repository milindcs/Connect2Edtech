import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cartList, API_BASE } from '../../shared/cartApi'
import { buildWhatsAppUrl, cleanText, WHATSAPP_PHONE } from '../../shared/whatsappUtils'

export default function ContactPage() {

  const [cart, setCart] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    document.title = 'Contact Us | Connect2Edtech'
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      // Contact page cart is derived from server-backed cart
      // (keep behavior unchanged: just show selected cart items, not raw localStorage)
      const { cartList } = await import('../../shared/cartApi.js')
      const res = await cartList()
      const items = Array.isArray(res?.items) ? res.items : []
      setCart(
        items.map((x) => ({
          key: x.courseKey,
          title: x.title,
          price: x.price,
          image: x.image,
          at: x.addedAt,
        }))
      )
    } catch (e) {
      setCart([])
    }
  }

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

    const coursesString = cart.length > 0
      ? cart.map((item) => item.title).join(', ')
      : ''

    const msgParts = [
      'Hello Connect2Edtech! (General Contact Inquiry)',
      `Name: ${cleanText(formData.name)}`,
      `Email: ${cleanText(formData.email)}`,
      `Phone: ${cleanText(formData.phone)}`,
      `Message: ${cleanText(formData.message)}`,
      coursesString ? `Selected Courses: ${cleanText(coursesString)}` : null
    ].filter(Boolean)

    let whatsappUrl = buildWhatsAppUrl(msgParts.join('\n'))

    // Persist contact submission to backend (gets WhatsApp URL)
    try {
      const res = await fetch(API_BASE + '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          courses: coursesString,
        })
      })
      const data = await res.json().catch(() => ({}))
      if (data.whatsappUrl) {
        whatsappUrl = data.whatsappUrl
      }
      showToast('Inquiry captured! Opening WhatsApp...', 'success')
    } catch (err) {
      console.error(err)
      showToast('Opening WhatsApp directly...', 'success')
    }

    setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }, 800)

    setIsSubmitted(true)
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <section className="detail-hero animate-on-scroll animate-fade-up" style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: '3rem', marginBottom: 12 }}>Contact Our Team</h1>
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
              Explore Courses
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
        <div className="contact-wrapper animate-on-scroll animate-fade-left stagger-2">
          <div className="card contact-form-card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Send Us a Message</h2>

            {cart.length > 0 && (
              <div className="enrollment-box">
                <h3>Course Inquiry Details</h3>
                <p>You have the following courses in your cart. We will attach these to your message:</p>
                <div id="enrollFromCart" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {cart.map((item) => (
                    <span 
                      key={item.key} 
                      style={{ 
                        background: 'rgba(99, 102, 241, 0.15)', 
                        border: '1px solid rgba(99, 102, 241, 0.3)', 
                        padding: '4px 10px', 
                        borderRadius: 20, 
                        fontSize: '0.82rem',
                        color: '#a5b4fc'
                      }}
                    >
                      {item.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                  placeholder="+91 7019436720"
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
                <a href="tel:+917019436720" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>+91 7019436720</a>
              </div>
            </div>

            <div className="info-item">
              <span style={{ fontSize: '1.4rem' }}>✉️</span>
              <div>
                <p style={{ fontWeight: 600 }}>Email Address</p>
                <a href="mailto:connect2future.main@gmail.com" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>connect2future.main@gmail.com</a>
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
