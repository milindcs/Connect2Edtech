import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { API_BASE } from '../../shared/cartApi'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin, isAuthenticated, token, user, signout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    document.title = 'Admin Dashboard | Connect2Edtech'
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    } else if (!isAdmin) {
      // keep for now; if admin role is missing server-side, user will be redirected
      navigate('/')
    }
  }, [isAuthenticated, isAdmin, navigate])

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch(API_BASE + '/api/admin/users', {
          headers: { Authorization: `Bearer ${token || ''}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch users')
        if (!cancelled) setUsers(data.users || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (data.message) setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId('')
    }
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="enroll-wrap">
      <div className="container">
        <div className="enroll-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 0 }}>Admin Dashboard</h2>
            <button onClick={signout} className="btn secondary">Sign Out</button>
          </div>

          {error && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{error}</p>}

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const currentRole = u.role || 'user'
                    const isSelf = u._id === user?._id
                    return (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: 8 }}>{u.name}{isSelf && <span style={{ fontSize: '0.75rem', color: '#be185d' }}> (you)</span>}</td>
                        <td style={{ padding: 8 }}>{u.email}</td>
                        <td style={{ padding: 8 }}>{u.phone}</td>
                        <td style={{ padding: 8 }}>{u.verified ? 'Verified' : 'Unverified'}</td>
                        <td style={{ padding: 8 }}>
                          <select
                            value={currentRole}
                            disabled={updatingId === u._id}
                            onChange={(e) => changeRole(u._id, e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: '#fff' }}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td style={{ padding: 8 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                  {users.length === 0 && (
                    <tr><td colSpan="6" style={{ padding: 16, textAlign: 'center' }}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
