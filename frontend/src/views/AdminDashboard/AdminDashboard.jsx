import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { API_BASE } from '../../shared/cartApi'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin, isAuthenticated, token, signout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Admin Dashboard | Connect2Edtech'
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    } else if (!isAdmin) {
      navigate('/')
    }
  }, [isAuthenticated, isAdmin, navigate])

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    const fetchUsers = async () => {
      try {
        const res = await fetch(API_BASE + '/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token || ''}`,
          },
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
    fetchUsers()
    return () => { cancelled = true }
  }, [isAdmin, token])

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="enroll-wrap">
      <div className="container">
        <div className="enroll-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 0 }}>Admin Dashboard</h2>
            <button onClick={signout} className="btn secondary">Sign Out</button>
          </div>

          {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 8 }}>{u.name}</td>
                      <td style={{ padding: 8 }}>{u.email}</td>
                      <td style={{ padding: 8 }}>{u.phone}</td>
                      <td style={{ padding: 8 }}>{u.verified ? 'Verified' : 'Unverified'}</td>
                      <td style={{ padding: 8 }}>{u.role || 'user'}</td>
                      <td style={{ padding: 8 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
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
