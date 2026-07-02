import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartList, cartRemove, cartClear } from '../../shared/cartApi'

export default function CartPage() {
  const [cart, setCart] = useState([])

  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Your Cart - Connect2Edtech'
    loadCart()

    const onUpdated = () => loadCart()
    window.addEventListener('cart-updated', onUpdated)
    return () => window.removeEventListener('cart-updated', onUpdated)
  }, [])

  const loadCart = async () => {
    try {
      const res = await cartList()
      // normalize backend payload to existing cart shape
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

  const handleRemove = async (key, title) => {
    try {
      await cartRemove(key)
      await loadCart()
      window.dispatchEvent(new Event('cart-updated'))
      showToast(`Removed ${title} from cart.`, 'success')
    } catch {
      showToast('Could not update cart.', 'error')
    }
  }


  const handleClear = async () => {
    if (!window.confirm('Clear all items from your cart?')) return
    try {
      await cartClear()
      setCart([])
      window.dispatchEvent(new Event('cart-updated'))
      showToast('Cart cleared successfully.', 'success')
    } catch {
      showToast('Could not clear cart.', 'error')
    }
  }


  const handleCheckout = (e) => {
    if (cart.length === 0) {
      e.preventDefault()
      showToast('Your cart is empty. Add a course first.', 'error')
      return
    }
    navigate('/checkout')
  }

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

  return (
    <div className="cart-wrap">
      <div className="container">
        <div className="cart-card">
          <h2 className="section-title">Your Cart</h2>
          <p className="section-subtitle">
            Manage your selected programs and proceed to checkout to secure your training slots.
          </p>

          {cart.length === 0 ? (
            <div id="cartEmpty" className="cart-empty">
              <p style={{ marginBottom: 16 }}>Your cart is empty. Browse courses to add them to your cart.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/courses" className="btn primary">
                  Browse Courses
                </Link>
                <Link to="/" className="btn secondary">
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div id="cartList" className="cart-list">
                {cart.map((item) => {
                  const addedDate = item.at ? new Date(item.at).toLocaleDateString() : ''
                  return (
                    <div className="card cart-item" key={item.key}>
                      <img
                        className="cart-thumb"
                        src={item.image || '/assets/edtech.png'}
                        alt={item.title || 'Course'}
                      />
                      <div className="cart-item-body">
                        <h3 className="cart-item-title">{item.title || 'Course'}</h3>
                        <p className="cart-item-meta">Course Key: {item.key}</p>
                        {addedDate && <p className="cart-item-meta">Added: {addedDate}</p>}
                      </div>
                      <div className="card-actions">
                        <Link to={`/course/${item.key}`} className="btn secondary">
                          Details
                        </Link>
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ color: 'var(--error)' }}
                          onClick={() => handleRemove(item.key, item.title)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="cart-summary">
                <div className="cart-summary-meta">
                  <div className="hint" style={{ marginBottom: 6 }}>
                    Courses in cart: {cart.length}
                  </div>
                  <div id="cartCount" className="total-box">
                    Estimated Total: ₹{total.toFixed(2)}
                  </div>
                  <div className="hint" style={{ marginTop: 6 }} id="cartAddHint">
                    Tip: You can add more courses from the <Link to="/courses">Courses Directory</Link>.
                  </div>
                </div>
              </div>

              <div className="cart-actions">
                <button id="clearCartBtn" className="btn-danger" type="button" onClick={handleClear}>
                  Clear Cart
                </button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link className="btn secondary" to="/courses">
                    Add More Courses
                  </Link>
                  <button type="button" className="btn primary" onClick={handleCheckout}>
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
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
