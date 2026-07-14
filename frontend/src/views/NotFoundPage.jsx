import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found - Connect2Edtech'
  }, [])

  return (
    <div className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
      <div className="detail-shell" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(4rem, 18vw, 8rem)',
          fontWeight: 900,
          lineHeight: 1,
          marginBottom: 8,
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '1.05rem' }}>
          The page you are looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn primary">Back to Home</Link>
          <Link to="/courses" className="btn secondary">Browse Courses</Link>
        </div>
      </div>
    </div>
  )
}
