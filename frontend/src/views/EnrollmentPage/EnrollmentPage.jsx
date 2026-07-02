import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartList, checkoutSubmit, cartClear, API_BASE } from '../../shared/cartApi'
import { buildWhatsAppUrl, cleanText, WHATSAPP_PHONE } from '../../shared/whatsappUtils'

export default function EnrollmentPage() {
  const [cart, setCart] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Enrollment - Connect2Edtech'
    loadCart()

    const onUpdated = () => loadCart()
    window.addEventListener('cart-updated', onUpdated)
    return () => window.removeEventListener('cart-updated', onUpdated)
  }, [])

  const loadCart = async () => {
    try {
      const res = await cartList()
      const items = (res?.items || []).map((x) => ({
        key: x.courseKey,
        title: x.title,
        price: x.price,
        image: x.image,
        at: x.addedAt,
      }))
      setCart(Array.isArray(items) ? items : [])
    } catch {
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

  const handleClearCart = async () => {
    if (!window.confirm('Clear your selected courses?')) return
    try {
      await cartClear()
      setCart([])
      window.dispatchEvent(new Event('cart-updated'))
      showToast('Selected courses cleared.', 'success')
    } catch {
      showToast('Could not clear courses.', 'error')
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (cart.length === 0) {
      showToast('Your cart is empty. Add a course first.', 'error')
      return
    }


    const coursesString = cart.map((item) => `${item.title} (Key: ${item.key}, Price: ₹${item.price})`).join('; ')
    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

    const msgParts = [
      'Hello Connect2Edtech! (New Enrollment Submission)',
      `Name: ${cleanText(formData.name)}`,
      `Email: ${cleanText(formData.email)}`,
      `Phone: ${cleanText(formData.phone)}`,
      `Courses: ${cleanText(coursesString)}`,
      `Total Amount: ₹${totalAmount.toFixed(2)}`,
      formData.message ? `Requirements: ${cleanText(formData.message)}` : null
    ].filter(Boolean)

    let whatsappUrl = buildWhatsAppUrl(msgParts.join('\n'))

    // Submit to backend (gets WhatsApp URL)
    try {
      const res = await fetch(API_BASE + '/api/checkout/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionType: 'enrollment',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          note: formData.message,
          courseTitle: cart.map((item) => item.title).join(', '),
          totalAmount: totalAmount,
        })
      })
      const data = await res.json().catch(() => ({}))
      if (data.whatsappUrl) {
        whatsappUrl = data.whatsappUrl
        try { await cartClear() } catch {}
      }
    } catch (e2) {
      console.error(e2)
    }

    setCart([])
    window.dispatchEvent(new Event('cart-updated'))

    setIsSubmitted(true)
    showToast('Enrollment verified. Connecting to support on WhatsApp...', 'success')
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
            Submit your contact information to register for the courses selected in your cart.
          </p>

          <div className="two-col">
            <section className="enroll-summary" aria-label="Enrollment Summary">
              <h2 className="summary-title">Your Selected Courses</h2>
              
              <div className="cart-mini" id="selectedCourses">
                {cart.length === 0 ? (
                  <div style={{ padding: '20px 0' }}>
                    <p className="hint">Cart is empty. Add a course first to register.</p>
                    <Link to="/courses" className="btn secondary" style={{ width: '100%', marginTop: 12, textAlign: 'center' }}>
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => {
                    const addedDate = item.at ? new Date(item.at).toLocaleDateString() : ''
                    return (
                      <div className="cart-mini-item" key={item.key}>
                        <img
                          className="cart-mini-thumb"
                          src={item.image || '/assets/edtech.png'}
                          alt={item.title || 'Course'}
                        />
                        <div style={{ minWidth: 0, flexGrow: 1 }}>
                          <p className="cart-mini-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </p>
                          <p className="cart-mini-meta">
                            {addedDate ? 'Added: ' + addedDate + ' • ' : ''}Key: {item.key}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="hint" style={{ marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                  Total selected courses: <strong>{cart.length}</strong>
                </div>
              )}
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
                  <button type="submit" className="btn primary" style={{ flexGrow: 1 }} disabled={cart.length === 0}>
                    Submit Enrollment
                  </button>
                  {cart.length > 0 && (
                    <button type="button" className="btn-ghost" style={{ color: 'var(--error)' }} onClick={handleClearCart}>
                      Clear Selected
                    </button>
                  )}
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
    </div>
  )
}
