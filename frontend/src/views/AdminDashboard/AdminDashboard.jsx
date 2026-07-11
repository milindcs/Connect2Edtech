import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { API_BASE } from '../../shared/cartApi'
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

const CACHE_KEY = 'admin_dashboard_cache'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isStaff, isAuthenticated, token, user, signout } = useAuth()
  const [users, setUsers] = useState([])
  const [contacts, setContacts] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const isOffline = useOnlineStatus()

  useEffect(() => {
    document.title = 'Admin Dashboard | Connect2Edtech'
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    } else if (!isStaff) {
      navigate('/')
    }
  }, [isAuthenticated, isStaff, navigate])

  useEffect(() => {
    if (!isAdmin || !token) return
    let cancelled = false
    const headers = { Authorization: `Bearer ${token}` }

    const load = async () => {
      setLoading(true)

      const cached = getCachedData(CACHE_KEY)
      if (cached) {
        if (!cancelled) {
          setUsers(cached.users || [])
          setContacts(cached.contacts || [])
          setEnrollments(cached.enrollments || [])
          setStats(cached.stats || null)
          setLoading(false)
        }
      }

      try {
        const [usersRes, statsRes, contactsRes, enrollmentsRes] = await Promise.all([
          fetch(API_BASE + '/api/admin/users', { headers }),
          fetch(API_BASE + '/api/admin/stats', { headers }),
          fetch(API_BASE + '/api/admin/contacts', { headers }),
          fetch(API_BASE + '/api/admin/enrollments', { headers }),
        ])

        const [usersData, statsData, contactsData, enrollmentsData] = await Promise.all([
          usersRes.json(),
          statsRes.json(),
          contactsRes.json(),
          enrollmentsRes.json(),
        ])

        if (!cancelled) {
          if (!usersRes.ok) throw new Error(usersData.error || 'Failed to load users')
          if (!statsRes.ok) throw new Error(statsData.error || 'Failed to load stats')
          if (!contactsRes.ok) throw new Error(contactsData.error || 'Failed to load contacts')
          if (!enrollmentsRes.ok) throw new Error(enrollmentsData.error || 'Failed to load enrollments')

          const dashboardData = {
            users: usersData.users || [],
            stats: statsData.stats || null,
            contacts: contactsData.contacts || [],
            enrollments: enrollmentsData.enrollments || [],
          }

          setUsers(dashboardData.users)
          setContacts(dashboardData.contacts)
          setEnrollments(dashboardData.enrollments)
          setStats(dashboardData.stats)

          setCachedData(CACHE_KEY, dashboardData)
        }
      } catch (err) {
        if (!cancelled) {
          if (!cached) setError(err.message || 'Failed to load dashboard.')
          else setError('You are viewing cached data (offline)')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [isAdmin, token])

  const changeRole = async (id, role) => {
    setUpdatingId(id)
    try {
      const res = await fetch(API_BASE + `/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update role')
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role } : u))
      )
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId('')
    }
  }

  if (!isAuthenticated || !isStaff) return null

  const statCards = useMemo(() => {
    if (!stats) return []
    return [
      { label: 'Users', value: stats.totalUsers },
      { label: 'Verified', value: stats.verifiedUsers },
      { label: 'Admins', value: stats.admins },
      { label: 'HR', value: stats.hrs },
      { label: 'Enrollments', value: stats.enrollments },
      { label: 'Messages', value: stats.contacts },
    ]
  }, [stats])

  return (
    <DashboardShell
      title="Admin Dashboard"
      roleLabel="Admin"
      stats={statCards}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Admin' },
      ]}
      rightHeader={
        <Link
          to="/hr"
          className="btn"
          style={{
            background: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(219, 39, 119, 0.4)',
            color: '#831843',
            padding: '10px 16px',
            textDecoration: 'none',
          }}
        >
          HR Dashboard →
        </Link>
      }
    >
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div
          className="card"
          style={{ padding: 24, background: 'linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(219,39,119,0.03) 100%)' }}
        >
          <h3 style={{ margin: '0 0 16px' }}>User Management</h3>
          <p style={{ color: '#6b2a4a', marginBottom: 16, marginTop: 0 }}>
            Search by name, email, or phone. Update roles instantly.
          </p>
          {loading && users.length === 0 ? (
            <p>Loading users…</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 100).map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 8 }}>
                        {u.name}
                        {u._id === user?._id && (
                          <span style={{ fontSize: '0.75rem', color: '#be185d' }}> (you)</span>
                        )}
                      </td>
                      <td style={{ padding: 8 }}>{u.email}</td>
                      <td style={{ padding: 8 }}>{u.phone}</td>
                      <td style={{ padding: 8 }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 999,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: u.verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          color: u.verified ? '#15803d' : '#854d0e',
                          border: `1px solid ${u.verified ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}`,
                        }}>
                          {u.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td style={{ padding: 8 }}>
                        <select
                          value={u.role || 'user'}
                          disabled={updatingId === u._id}
                          onChange={(e) => changeRole(u._id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            border: '1px solid var(--border-color)',
                            background: '#fff',
                            minWidth: 96,
                          }}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                          <option value="hr">hr</option>
                        </select>
                      </td>
                      <td style={{ padding: 8 }}>{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          className="card"
          style={{ padding: 24, background: 'linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(219,39,119,0.03) 100%)' }}
        >
          <h3 style={{ margin: '0 0 16px' }}>Recent Contact Inquiries</h3>
          {loading && contacts.length === 0 ? (
            <p>Loading…</p>
          ) : contacts.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>No contact inquiries yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Message</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Date</th>
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
        </div>

        <div
          className="card"
          style={{ padding: 24, background: 'linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(219,39,119,0.03) 100%)' }}
        >
          <h3 style={{ margin: '0 0 16px' }}>Recent Enrollments</h3>
          {loading && enrollments.length === 0 ? (
            <p>Loading…</p>
          ) : enrollments.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>No enrollments yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Course</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>College</th>
                    <th style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>Date</th>
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
        </div>
      </div>
    </DashboardShell>
  )
}
