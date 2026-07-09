import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { API_BASE } from '../../shared/cartApi'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

export default function HrDashboard() {
  const navigate = useNavigate()
  const { isAdmin, isAuthenticated, token, signout } = useAuth()
  const [contacts, setContacts] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [checkouts, setCheckouts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'HR Dashboard | Connect2Edtech'
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    } else if (!isAdmin) {
      navigate('/')
    }
  }, [isAuthenticated, isAdmin, navigate])

  useEffect(() => {
    if (!isAdmin || !token) return
    let cancelled = false
    const headers = { Authorization: `Bearer ${token}` }

    const load = async () => {
      setLoading(true)
      try {
        const [statsRes, contactsRes, enrollmentsRes, checkoutsRes] = await Promise.all([
          fetch(API_BASE + '/api/admin/stats', { headers }),
          fetch(API_BASE + '/api/admin/contacts', { headers }),
          fetch(API_BASE + '/api/admin/enrollments', { headers }),
          fetch(API_BASE + '/api/admin/checkouts', { headers }),
        ])
        const [statsData, contactsData, enrollmentsData, checkoutsData] = await Promise.all([
          statsRes.json(),
          contactsRes.json(),
          enrollmentsRes.json(),
          checkoutsRes.json(),
        ])
        if (!cancelled) {
          if (!statsRes.ok) throw new Error(statsData.error || 'Failed to load stats')
          if (!contactsRes.ok) throw new Error(contactsData.error || 'Failed to load contacts')
          if (!enrollmentsRes.ok) throw new Error(enrollmentsData.error || 'Failed to load enrollments')
          if (!checkoutsRes.ok) throw new Error(checkoutsData.error || 'Failed to load checkouts')
          setStats(statsData.stats || null)
          setContacts(contactsData.contacts || [])
          setEnrollments(enrollmentsData.enrollments || [])
          setCheckouts(checkoutsData.checkouts || [])
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load HR dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isAdmin, token])

  if (!isAuthenticated || !isAdmin) return null

  const hrStats = stats ? [
    { label: 'Total Contacts', value: stats.contacts },
    { label: 'Enrollments', value: stats.enrollments },
    { label: 'Orders', value: stats.checkouts },
    { label: 'Revenue', value: `₹${stats.revenue || 0}` },
  ] : []

  return (
    <div className="enroll-wrap">
      <div className="container">
        <div className="enroll-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 0 }}>HR Dashboard</h2>
            <button onClick={signout} className="btn secondary">Sign Out</button>
          </div>

          {error && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{error}</p>}

          {stats && (
            <div className="card-grid" style={{ margin: '8px 0 32px' }}>
              {hrStats.map((s) => (
                <div key={s.label} className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-title)', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {s.value}
                  </div>
                  <div style={{ color: '#6b2a4a', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Contacts */}
          <h3 style={{ margin: '8px 0 12px' }}>Recent Contact Inquiries</h3>
          {loading ? <p>Loading…</p> : contacts.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>No contact inquiries yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Message</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.slice(0, 20).map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 8 }}>{c.name || '—'}</td>
                      <td style={{ padding: 8 }}>{c.email || '—'}</td>
                      <td style={{ padding: 8 }}>{c.phone || '—'}</td>
                      <td style={{ padding: 8, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message || '—'}</td>
                      <td style={{ padding: 8 }}>{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent Enrollments */}
          <h3 style={{ margin: '32px 0 12px' }}>Recent Enrollments</h3>
          {loading ? <p>Loading…</p> : enrollments.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>No enrollments yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Course</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>College</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.slice(0, 20).map((e) => (
                    <tr key={e._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 8 }}>{e.name || '—'}</td>
                      <td style={{ padding: 8 }}>{e.email || '—'}</td>
                      <td style={{ padding: 8 }}>{e.phone || '—'}</td>
                      <td style={{ padding: 8 }}>{e.courseTitle || e.courseKey || '—'}</td>
                      <td style={{ padding: 8 }}>{e.college || '—'}</td>
                      <td style={{ padding: 8 }}>{formatDate(e.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent Orders */}
          <h3 style={{ margin: '32px 0 12px' }}>Recent Orders</h3>
          {loading ? <p>Loading…</p> : checkouts.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>No orders yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: 8 }}>Type</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Courses</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Total</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {checkouts.slice(0, 20).map((o) => (
                    <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 8, textTransform: 'capitalize' }}>{o.submissionType || 'order'}</td>
                      <td style={{ padding: 8 }}>{o.name || '—'}</td>
                      <td style={{ padding: 8 }}>{o.email || '—'}</td>
                      <td style={{ padding: 8, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(o.courses || []).map((c) => c.title).filter(Boolean).join(', ') || o.courseTitle || '—'}
                      </td>
                      <td style={{ padding: 8, fontWeight: 700 }}>₹{o.totalAmount || 0}</td>
                      <td style={{ padding: 8 }}>{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
