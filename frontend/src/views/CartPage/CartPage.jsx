import React from 'react'
import { Link } from 'react-router-dom'

export default function CartPage() {
  return (
    <div className="cart-wrap">
      <div className="container">
        <div className="cart-card">
          <h2 className="section-title">Your Cart</h2>
          <p className="section-subtitle">
            The cart feature is currently unavailable. You can enroll directly in courses.
          </p>

          <div id="cartEmpty" className="cart-empty">
            <p style={{ marginBottom: 16 }}>Browse our courses and enroll directly.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/courses" className="btn primary">
                Browse Courses
              </Link>
              <Link to="/" className="btn secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
