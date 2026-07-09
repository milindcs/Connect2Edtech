import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { API_BASE } from '../../shared/cartApi'
import { cartList } from '../../shared/cartApi'
import { getCachedData, setCachedData, useOnlineStatus } from '../../shared/storageUtils'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

const CACHE_KEY = 'student_dashboard_cache'

export default function StudentPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, token, signout } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [contacts, setContacts] = useState([])
  const [checkouts, setCheckouts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isOffline = useOnlineStatus()

  useEffect(() => {
    document.title = 'Student Portal | Connect2Edtech'
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

      // Try to load from cache first
      const cached = getCachedData()
      if (cached) {
        if (!cancelled) {
          setEnrollments(cached.enrollments || [])
          setContacts(cached.contacts || [])
          setCheckouts(cached.checkouts || [])
          setCart(cached.cart || [])
          setLoading(false)
        }
      }

      // Then fetch fresh data
      try {
        const [enrRes, conRes, chkRes] = await Promise.all([
          fetch(API_BASE + '/api/me/enrollments', { headers: authHeaders }),
          fetch(API_BASE + '/api/me/contacts', { headers: authHeaders }),
          fetch(API_BASE + '/api/me/checkouts', { headers: authHeaders }),
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

          const cartData = (await cartList()).items || []

          const portalData = {
            enrollments: enr.enrollments || [],
            contacts: con.contacts || [],
            checkouts: chk.checkouts || [],
            cart: cartData,
          }

          setEnrollments(portalData.enrollments)
          setContacts(portalData.contacts)
          setCheckouts(portalData.checkouts)
          setCart(portalData.cart)

          // Cache the data
          setCachedData(portalData)
        }
      } catch (err) {
        if (!cancelled) {
          // If fetch fails and we have no cache, show error
          if (!cached) setError(err.message || 'Failed to load student portal.')
          // If we have cache, use it silently (offline mode)
          else setError('You are viewing cached data (offline)')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isAuthenticated, token])


  if (!isAuthenticated) return null

  const stats = [
    { label: 'My Courses', value: enrollments.length },
    { label: 'My Purchases', value: checkouts.length },
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
                Student Portal
              </h2>
              <p style={{ color: '#6b2a4a' }}>Welcome back, {user?.name || 'student'}!</p>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#9d174d', background: 'rgba(236, 72, 153, 0.08)', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(219, 39, 119, 0.15)' }}>{user?.role === 'admin' ? 'Admin' : 'Student'}</span>
            </div>
            <button onClick={signout} className="btn secondary">Sign Out</button>
          </div>

          {isOffline && (
            <div style={{ padding: 12, background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 8, marginBottom: 16, color: '#854d0e' }}>
              ⚠️ You are currently offline. Showing cached data.
            </div>
          )}
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
            <Link to="/courses" className="card" style={{ padding: 24, textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, minHeight: 120 }}>
              <div style={{ fontSize: '2.5rem' }}>📚</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6b2a4a' }}>Browse Courses</div>
              <div style={{ fontSize: '0.85rem', color: '#9d174d' }}>Explore programs →</div>
            </Link>
          </div>

          {/* Profile */}
          <div className="card" style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16 }}>My Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Name</div><div>{user?.name || '—'}</div></div>
              <div><div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Email</div><div>{user?.email || '—'}</div></div>
              <div><div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Phone</div><div>{user?.phone || '—'}</div></div>
              <div><div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Status</div><div>{user?.verified ? 'Verified' : 'Unverified'}</div></div>
            </div>
          </div>

          {/* Enrollments */}
          <h3 style={{ margin: '8px 0 12px' }}>My Learning</h3>
          {loading ? <p>Loading…</p> : enrollments.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>You haven't enrolled in any courses yet. <Link to="/courses">Browse courses</Link> to get started.</p>
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
          <h3 style={{ margin: '32px 0 12px' }}>My Purchases</h3>
          {loading ? <p>Loading…</p> : checkouts.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>No purchases yet. <Link to="/courses">Start shopping</Link> for courses.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {checkouts.map((o) => (
                <div key={o._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong style={{ textTransform: 'capitalize' }}>{o.submissionType || 'purchase'}</strong>
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
            <p style={{ color: '#6b2a4a' }}>No messages sent yet. <Link to="/contact">Contact us</Link> for any queries.</p>
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
          <h3 style={{ margin: '32px 0 12px' }}>My Cart</h3>
          {cart.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>Your cart is empty. <Link to="/courses">Add courses</Link> to start learning.</p>
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
