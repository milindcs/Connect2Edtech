import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import api from '../../shared/api'
import { getCachedData, setCachedData, useOnlineStatus } from '../../shared/storageUtils'
import DashboardShell from '../shared/dashboard/DashboardShell'

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
    const headers = { Authorization: `Bearer ${token}` }

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
            <div style={{ fontSize: '0.8rem', color: '#9d174d', fontWeight: 700, textTransform: 'uppercase' }}>Status</div>
            <div>
              <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 700,
                background: user?.verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                color: user?.verified ? '#15803d' : '#854d0e',
                border: `1px solid ${user?.verified ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}`,
              }}>
                {user?.verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
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
                    <strong>{e.courseTitle || e.courseKey || 'Course'}</strong>
                    <span style={{ color: '#9d174d', fontSize: '0.85rem' }}>{formatDate(e.createdAt)}</span>
                  </div>
                  {e.college && <div style={{ color: '#6b2a4a', fontSize: '0.9rem', marginTop: 4 }}>College: {e.college}</div>}
                  {e.message && <div style={{ color: '#6b2a4a', fontSize: '0.9rem', marginTop: 4 }}>{e.message}</div>}
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
                    <strong>{c.subject || 'Message'}</strong>
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
