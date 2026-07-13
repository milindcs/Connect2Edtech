import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import api from '../../shared/api'
import { getCachedData, setCachedData, useOnlineStatus } from '../../shared/storageUtils'
import { coursesData } from '../../shared/coursesData'
import DashboardShell from '../shared/dashboard/DashboardShell'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

function formatCurrency(value) {
  const num = Number(value) || 0
  if (num === 0) return 'Free'
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

const CACHE_KEY = 'student_dashboard_cache'

export default function StudentPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, token } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isOffline = useOnlineStatus()

  useEffect(() => {
    document.title = 'Student Portal | Connect2Edtech'
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false)
      return
    }
    let cancelled = false

    const load = async () => {
      setLoading(true)

      const cached = getCachedData(CACHE_KEY)
      if (cached) {
        if (!cancelled) {
          setEnrollments(cached.enrollments || [])
          setContacts(cached.contacts || [])
          setLoading(false)
        }
      }

      try {
        const [enr, con] = await Promise.all([
          api.get('/api/me/enrollments'),
          api.get('/api/me/contacts'),
        ])

        if (!cancelled) {
          const portalData = {
            enrollments: enr.data?.enrollments || [],
            contacts: con.data?.contacts || [],
          }

          setEnrollments(portalData.enrollments)
          setContacts(portalData.contacts)

          setCachedData(CACHE_KEY, portalData)
        }
      } catch (err) {
        if (!cancelled) {
          if (!cached) setError(err.message || 'Failed to load student portal.')
          else setError('You are viewing cached data (offline)')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [isAuthenticated, token])

  const myCourses = useMemo(() => {
    return enrollments
      .map((e) => {
        const details = coursesData[e.courseKey]
        return {
          ...e,
          details: details || null,
        }
      })
      .filter((item) => item.details != null)
  }, [enrollments])

  const stats = useMemo(() => [
    { label: 'My Courses', value: enrollments.length },
    { label: 'Messages', value: contacts.length },
  ], [enrollments.length, contacts.length])

  return (
    <DashboardShell
      title="Student Portal"
      roleLabel={user?.role === 'admin' ? 'Admin' : 'Student'}
      stats={stats}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Student Portal' },
      ]}
      rightHeader={
        <Link
          to="/courses"
          className="btn"
          style={{
            background: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(219, 39, 119, 0.4)',
            color: '#831843',
            padding: '10px 16px',
            textDecoration: 'none',
          }}
        >
          Browse Courses →
        </Link>
      }
      >
        {!isAuthenticated && (
          <div className="card" style={{ padding: 24, marginBottom: 24, textAlign: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Sign in to view your dashboard</h3>
            <p style={{ color: '#6b2a4a' }}>Your courses, messages, and profile are available after you sign in.</p>
            <Link to="/signin" className="btn primary">Sign In</Link>
          </div>
        )}
        {isOffline && (
          <div
            style={{
              padding: 12,
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: 8,
              marginBottom: 16,
              color: '#854d0e',
            }}
          >
            ⚠️ You are currently offline. Showing cached data.
          </div>
        )}
      {error && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{error}</p>}

      <div
        className="card"
        style={{ padding: 24, marginBottom: 32, background: 'linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(219,39,119,0.03) 100%)' }}
      >
        <h3 style={{ margin: '0 0 16px' }}>My Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Name</div>
            <div>{user?.name || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Email</div>
            <div>{user?.email || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Phone</div>
            <div>{user?.phone || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>WhatsApp</div>
            <div>{user?.whatsappNumber || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Role</div>
            <div style={{ textTransform: 'capitalize' }}>{user?.role || 'user'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Account Status</div>
            <div style={{ color: user?.verified ? 'green' : '#b45309', fontWeight: 600 }}>
              {user?.verified ? '✅ Verified' : '⏳ Unverified'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div
          className="card"
          style={{ padding: 24, background: 'linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(219,39,119,0.03) 100%)' }}
        >
          <h3 style={{ margin: '0 0 16px' }}>My Courses</h3>
          {loading && myCourses.length === 0 ? (
            <p>Loading…</p>
          ) : myCourses.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>You haven't enrolled in any courses yet. <Link to="/courses">Browse courses</Link> to get started.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {myCourses.map((item) => {
                const course = item.details
                return (
                  <div key={item._id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <strong>{course.title}</strong>
                      <span style={{ color: '#9d174d', fontSize: '0.85rem' }}>{formatDate(item.createdAt)}</span>
                    </div>
                    {course.meta && <div style={{ fontSize: '0.85rem', color: '#6b2a4a' }}>{course.meta}</div>}
                    <div style={{ fontSize: '0.9rem', color: '#6b2a4a' }}>{course.subtitle}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b2a4a', marginTop: 4 }}>Enrolled: {formatDate(item.createdAt)} {item.college ? `• ${item.college}` : ''}</div>
                    {Array.isArray(course.features) && course.features.length > 0 && (
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {course.features.slice(0, 3).map((f, idx) => (
                          <li key={idx} style={{ fontSize: '0.85rem', color: '#6b2a4a', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'var(--border-focus)' }}>✦</span> {f}
                          </li>
                        ))}
                        {course.features.length > 3 && (
                          <li style={{ fontSize: '0.85rem', color: '#6b2a4a', fontStyle: 'italic' }}>
                            + {course.features.length - 3} more modules
                          </li>
                        )}
                      </ul>
                    )}
                    <Link to={`/course/${item.courseKey}`} className="btn primary" style={{ textAlign: 'center', marginTop: 8 }}>
                      View Details
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div
          className="card"
          style={{ padding: 24, background: 'linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(219,39,119,0.03) 100%)' }}
        >
          <h3 style={{ margin: '0 0 16px' }}>My Learning</h3>
          {loading && enrollments.length === 0 ? (
            <p>Loading…</p>
          ) : enrollments.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>You haven't enrolled in any courses yet. <Link to="/courses">Browse courses</Link> to get started.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enrollments.map((e) => (
                <div key={e._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <strong>{e.courseTitle || e.courseKey || 'Course'}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#6b2a4a', marginTop: 4 }}>Course Key: {e.courseKey || '—'}</div>
                    </div>
                    <span style={{ color: '#9d174d', fontSize: '0.85rem' }}>{formatDate(e.createdAt)}</span>
                  </div>
                  {e.college && <div style={{ color: '#6b2a4a', fontSize: '0.9rem', marginTop: 4 }}>College: {e.college}</div>}
                  {e.message && <div style={{ color: '#6b2a4a', fontSize: '0.9rem', marginTop: 4 }}>Message: {e.message}</div>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link to={`/course/${e.courseKey}`} className="btn primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>View Course</Link>
                    <Link to="/courses" className="btn secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Browse More</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="card"
          style={{ padding: 24, background: 'linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(219,39,119,0.03) 100%)' }}
        >
          <h3 style={{ margin: '0 0 16px' }}>My Messages</h3>
          {loading && contacts.length === 0 ? (
            <p>Loading…</p>
          ) : contacts.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>No messages sent yet. <Link to="/contact">Contact us</Link> for any queries.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {contacts.map((c) => (
                <div key={c._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong>{c.name || c.email || 'Message'}</strong>
                    <span style={{ color: '#9d174d', fontSize: '0.85rem' }}>{formatDate(c.createdAt)}</span>
                  </div>
                  <div style={{ color: '#6b2a4a', fontSize: '0.9rem', marginTop: 4 }}>{c.message || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
