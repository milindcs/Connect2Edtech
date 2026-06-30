import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartList, checkoutSubmit, cartClear } from '../../shared/cartApi'

export default function CheckoutPage() {
  const [cart, setCart] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    note: '',
    courseTitle: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Checkout - Connect2Edtech'
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (cart.length === 0 && !formData.courseTitle.trim()) {
      showToast('Your cart is empty. Please add a course first.', 'error')
      return
    }


    const coursesString = cart.length > 0 
      ? cart.map((item) => `${item.title} (Key: ${item.key}, Price: ₹${item.price})`).join('; ')
      : formData.courseTitle.trim();
    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

    // Submit to backend (gets WhatsApp URL)
    try {
      const res = await fetch('/api/checkout/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionType: 'checkout',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          note: formData.note,
          courseTitle: formData.courseTitle || '',
          totalAmount: totalAmount,
        })
      })
      const data = await res.json().catch(() => ({}))
      if (data.whatsappUrl) {
        try { await cartClear() } catch {}
        setCart([])
        window.dispatchEvent(new Event('cart-updated'))
        setIsSubmitted(true)
        showToast('Order verified! Connecting to WhatsApp...', 'success')
        setTimeout(() => {
          window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer')
        }, 800)
      }
    } catch (e2) {
      console.error(e2)
    }
  }

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

  if (isSubmitted) {
    return (
      <div className="checkout-wrap">
        <div className="container">
          <div className="checkout-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: 20 }}>✓</div>
            <h2 className="section-title">Inquiry Sent!</h2>
            <p className="section-subtitle">
              Your checkout request has been registered. We are redirecting you to WhatsApp to complete your enrollment with our team.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32 }}>
              <Link to="/courses" className="btn secondary">
                Back to Courses
              </Link>
              <a 
                href={`https://wa.me/917019436720?text=${encodeURIComponent('Hi, I just submitted my checkout on Connect2Edtech!')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn primary"
              >
                Open WhatsApp Manually
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-wrap">
      <div className="container">
        <div className="checkout-card">
          <h2 className="section-title">Proceed to Checkout</h2>
          <p className="section-subtitle">
            Provide your details below to submit your course enrollment and complete verification via WhatsApp.
          </p>

          <div className="two-col">
            <section className="summary-box" aria-label="Order Summary">
              <h2 className="summary-title">Selected Course Summary</h2>
              <div id="checkoutList" className="cart-mini">
                {cart.length === 0 ? (
                  <div style={{ padding: '20px 0' }}>
                    <p className="hint">No items in cart. Enter the course title in the form to checkout directly.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div className="cart-mini-item" key={item.key}>
                      <img
                        className="cart-mini-thumb"
                        src={item.image || '/edtech.png'}
                        alt={item.title}
                      />
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <p className="cart-mini-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </p>
                        <p className="cart-mini-meta">Key: {item.key}</p>
                      </div>
<div className="hint" style={{ fontWeight: 800, color: 'var(--text-white)' }}>
                         ₹{(item.price || 0).toFixed(2)}
                       </div>
                    </div>
                  ))
                )}
              </div>

              <div className="line-item" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 16 }}>
                <span className="muted">Total Courses</span>
                <span id="checkoutCount" className="total">
                  {cart.length}
                </span>
              </div>
              <div className="line-item">
                <span className="muted">Estimated Total</span>
<span id="checkoutTotal" className="total" style={{ color: 'var(--border-focus)', fontSize: '1.2rem' }}>
                   ₹{total.toFixed(2)}
                 </span>
              </div>
            </section>

            <section aria-label="Checkout Form">
              <form id="checkoutForm" className="form-grid" onSubmit={handleSubmit}>
                <label>
                  <span className="field-label">Full Name</span>
                  <input
                    id="checkoutName"
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
                    id="checkoutEmail"
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
                    id="checkoutPhone"
                    name="phone"
                    required
                    type="tel"
                    placeholder="+91 7019436720"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </label>
                
                {cart.length === 0 && (
                  <label>
                    <span className="field-label">Course Title</span>
                    <input
                      id="checkoutCourseTitle"
                      name="courseTitle"
                      required
                      placeholder="e.g. Web Development"
                      value={formData.courseTitle}
                      onChange={handleInputChange}
                    />
                  </label>
                )}

                <label>
                  <span className="field-label">Note for the Team (optional)</span>
                  <textarea
                    id="checkoutNote"
                    name="note"
                    rows={3}
                    placeholder="Share any questions or custom requirements..."
                    value={formData.note}
                    onChange={handleInputChange}
                  />
                </label>

                <div className="form-actions">
                  <button type="submit" className="btn primary" style={{ flexGrow: 1 }}>
                    Confirm & Complete
                  </button>
                  <Link to="/cart" className="btn secondary">
                    Back to Cart
                  </Link>
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