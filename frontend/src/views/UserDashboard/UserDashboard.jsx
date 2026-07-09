import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { API_BASE } from '../../shared/cartApi'
import { cartList } from '../../shared/cartApi'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, token, signout } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [contacts, setContacts] = useState([])
  const [checkouts, setCheckouts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'My Dashboard | Connect2Edtech'
  }, [])

  useEffect(() => {
    if (!isAuthenticated) navigate('/signin')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!isAuthenticated || !token) return
    let cancelled = false
    const authHeaders = { Authorization: `Bearer ${token}` }

    const load = async () => {
      setLoading(true)
      try {
        const [enrRes, conRes, chkRes, cartData] = await Promise.all([
          fetch(API_BASE + '/api/me/enrollments', { headers: authHeaders }),
          fetch(API_BASE + '/api/me/contacts', { headers: authHeaders }),
          fetch(API_BASE + '/api/me/checkouts', { headers: authHeaders }),
          cartList().catch(() => ({ ok: true, items: [] })),
        ])
        const [enr, con, chk] = await Promise.all([
          enrRes.json(),
          conRes.json(),
          chkRes.json(),
        ])
        if (!cancelled) {
          if (!enrRes.ok) throw new Error(enr.error || 'Failed to load enrollments')
          if (!conRes.ok) throw new Error(con.error || 'Failed to load messages')
          if (!chkRes.ok) throw new Error(chk.error || 'Failed to load orders')
          setEnrollments(enr.enrollments || [])
          setContacts(con.contacts || [])
          setCheckouts(chk.checkouts || [])
          setCart(cartData.items || [])
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isAuthenticated, token])

  if (!isAuthenticated) return null

  const stats = [
    { label: 'Enrollments', value: enrollments.length },
    { label: 'Orders', value: checkouts.length },
    { label: 'Messages', value: contacts.length },
    { label: 'Cart Items', value: cart.length },
  ]

  return (
    <div className="enroll-wrap">
      <div className="container">
        <div className="enroll-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 4, textAlign: 'left' }}>
                My Dashboard
              </h2>
              <p style={{ color: '#6b2a4a' }}>Welcome back, {user?.name || 'learner'}!</p>
            </div>
            <button onClick={signout} className="btn secondary">Sign Out</button>
          </div>

          {error && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{error}</p>}

          <div className="card-grid" style={{ margin: '8px 0 32px' }}>
            {stats.map((s) => (
              <div key={s.label} className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-title)', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {loading ? '…' : s.value}
                </div>
                <div style={{ color: '#6b2a4a', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
            <Link to="/student" className="card" style={{ padding: 24, textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, minHeight: 120 }}>
              <div style={{ fontSize: '2.5rem' }}>🎓</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6b2a4a' }}>Student Portal</div>
              <div style={{ fontSize: '0.85rem', color: '#9d174d' }}>Open student page →</div>
            </Link>
          </div>

          {/* Profile */}
          <div className="card" style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16 }}>Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Name</div><div>{user?.name || '—'}</div></div>
              <div><div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Email</div><div>{user?.email || '—'}</div></div>
              <div><div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Phone</div><div>{user?.phone || '—'}</div></div>
              <div><div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Status</div><div>{user?.verified ? 'Verified' : 'Unverified'}</div></div>
            </div>
          </div>

          {/* Enrollments */}
          <h3 style={{ margin: '8px 0 12px' }}>My Enrollments</h3>
          {loading ? <p>Loading…</p> : enrollments.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>You haven't enrolled in any courses yet. <Link to="/courses">Browse courses</Link>.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enrollments.map((e) => (
                <div key={e._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong>{e.courseTitle || e.courseKey || 'Course'}</strong>
                    <span style={{ color: '#9d174d', fontSize: '0.85rem' }}>{formatDate(e.createdAt)}</span>
                  </div>
                  {e.college && <div style={{ color: '#6b2a4a', fontSize: '0.9rem', marginTop: 4 }}>College: {e.college}</div>}
                  {e.message && <div style={{ color: '#6b2a4a', fontSize: '0.9rem', marginTop: 4 }}>{e.message}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Orders */}
          <h3 style={{ margin: '32px 0 12px' }}>My Orders</h3>
          {loading ? <p>Loading…</p> : checkouts.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>No orders yet. <Link to="/courses">Start shopping</Link>.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {checkouts.map((o) => (
                <div key={o._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong style={{ textTransform: 'capitalize' }}>{o.submissionType || 'order'}</strong>
                    <span style={{ color: '#9d174d', fontWeight: 700 }}>₹{o.totalAmount || 0}</span>
                  </div>
                  <div style={{ color: '#6b2a4a', fontSize: '0.9rem', marginTop: 4 }}>
                    {(o.courses || []).map((c) => c.title).filter(Boolean).join(', ') || o.courseTitle || '—'}
                  </div>
                  <div style={{ color: '#9d174d', fontSize: '0.85rem', marginTop: 4 }}>{formatDate(o.createdAt)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <h3 style={{ margin: '32px 0 12px' }}>My Messages</h3>
          {loading ? <p>Loading…</p> : contacts.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>No messages sent yet. <Link to="/contact">Contact us</Link>.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {contacts.map((c) => (
                <div key={c._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong>{c.subject || 'Message'}</strong>
                    <span style={{ color: '#9d174d', fontSize: '0.85rem' }}>{formatDate(c.createdAt)}</span>
                  </div>
                  <div style={{ color: '#6b2a4a', fontSize: '0.9rem', marginTop: 4 }}>{c.message || '—'}</div>
                </div>
              ))}
            </div>
          )}

          {/* Current cart */}
          <h3 style={{ margin: '32px 0 12px' }}>Current Cart</h3>
          {cart.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>Your cart is empty. <Link to="/courses">Add courses</Link>.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.map((it) => (
                <div key={it.courseKey} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{it.title || it.courseKey}</span>
                  <span style={{ color: '#9d174d', fontWeight: 700 }}>₹{it.price || 0}</span>
                </div>
              ))}
              <Link to="/cart" className="btn primary" style={{ alignSelf: 'flex-start', marginTop: 4 }}>View Cart</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
