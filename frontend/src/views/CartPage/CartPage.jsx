import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cartList, cartRemove, cartClear, checkoutSubmit } from '../../shared/cartApi'

export default function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Your Cart - Connect2Edtech'
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await cartList()
        if (!cancelled) setItems(data.items || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load cart.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

  const handleRemove = async (courseKey) => {
    setError('')
    try {
      await cartRemove(courseKey)
      setItems((prev) => prev.filter((it) => it.courseKey !== courseKey))
    } catch (err) {
      setError(err.message || 'Failed to remove item.')
    }
  }

  const handleClear = async () => {
    setError('')
    try {
      await cartClear()
      setItems([])
    } catch (err) {
      setError(err.message || 'Failed to clear cart.')
    }
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const form = new FormData(e.target)
      const payload = {
        name: form.get('name') || '',
        email: form.get('email') || '',
        phone: form.get('phone') || '',
        college: form.get('college') || '',
        items: items.map((it) => ({
          courseKey: it.courseKey,
          title: it.title,
          price: it.price,
          image: it.image,
        })),
        total,
      }
      await checkoutSubmit(payload)
      setItems([])
      alert('Checkout submitted successfully! We will contact you shortly.')
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p>Loading your cart…</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '80px 24px' }}>
      <div className="detail-shell" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>Your Cart</h1>

        {error && (
          <div style={{ color: 'var(--error)', marginBottom: 16, padding: 12, border: '1px solid var(--error)', borderRadius: 6 }}>
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 24 }}>Your cart is empty.</p>
            <Link to="/courses" className="btn primary">Browse Courses</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((item) => (
                <div key={item.courseKey} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
                  {item.image && (
                    <img src={item.image} alt={item.title} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                  )}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.title || item.courseKey}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {item.price === 0 ? 'Free' : `₹${Number(item.price).toFixed(2)}`}
                    </div>
                  </div>
                  <button type="button" className="btn secondary" onClick={() => handleRemove(item.courseKey)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: '1.2rem', fontWeight: 700 }}>
                <span>Total</span>
                <span>{total === 0 ? 'Free' : `₹${total.toFixed(2)}`}</span>
              </div>

              <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="name" style={{ fontWeight: 500 }}>Full Name *</label>
                    <input id="name" name="name" className="search-input" required placeholder="Enter your full name" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="email" style={{ fontWeight: 500 }}>Email *</label>
                    <input id="email" name="email" type="email" className="search-input" required placeholder="you@example.com" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="phone" style={{ fontWeight: 500 }}>Phone *</label>
                    <input id="phone" name="phone" className="search-input" required placeholder="Enter phone number" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="college" style={{ fontWeight: 500 }}>College / Institution</label>
                    <input id="college" name="college" className="search-input" placeholder="Optional" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn secondary" onClick={handleClear} disabled={submitting}>
                    Clear Cart
                  </button>
                  <button type="submit" className="btn primary" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Confirm Checkout'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
