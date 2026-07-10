import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { API_BASE } from '../../shared/cartApi'
import { getCachedData, setCachedData, useOnlineStatus } from '../../shared/storageUtils'
import DashboardShell from '../shared/dashboard/DashboardShell'
import DataTable from '../shared/dashboard/DataTable'
import ChartCards from '../shared/dashboard/ChartCards'


const CACHE_KEY = 'admin_dashboard_cache'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin, isAuthenticated, token, user, signout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [stats, setStats] = useState(null)
  const isOffline = useOnlineStatus()



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
      // Try to load from cache first
      const cached = getCachedData(CACHE_KEY)
      if (cached) {
        if (!cancelled) {
          setUsers(cached.users || [])
          setStats(cached.stats)
          setLoading(false)
        }
      }

      // Then fetch fresh data
      try {
        const res = await fetch(API_BASE + '/api/admin/users', {
          headers: { Authorization: `Bearer ${token || ''}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch users')
        if (!cancelled) {
          setUsers(data.users || [])
          // Cache the data
          setCachedData(CACHE_KEY, {
            users: data.users || [],
            stats: stats
          })
        }
      } catch (err) {
        if (!cancelled) {
          // If fetch fails and we have no cache, show error
          if (!cached) setError(err.message)
          // If we have cache, use it silently (offline mode)
          else setError('You are viewing cached data (offline)')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, token])

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    const loadStats = async () => {
      try {
        const res = await fetch(API_BASE + '/api/admin/stats', {
          headers: { Authorization: `Bearer ${token || ''}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load stats')
        if (!cancelled) {
          setStats(data.stats)
          // Update cache with new stats
          const cached = getCachedData(CACHE_KEY)
          if (cached) {
            setCachedData(CACHE_KEY, {
              ...cached,
              stats: data.stats
            })
          }
        }
      } catch {
        // stats are non-critical; ignore if online
        // If offline, cached stats will be used
      }
    }
    loadStats()
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
      if (data.message) setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId('')
    }
  }

  if (!isAuthenticated || !isAdmin) return null

  const statCards = stats
    ? [
        { label: 'Users', value: stats.totalUsers },
        { label: 'Verified', value: stats.verifiedUsers },
        { label: 'Admins', value: stats.admins },
        { label: 'Enrollments', value: stats.enrollments },
        { label: 'Messages', value: stats.contacts },
        { label: 'Orders', value: stats.checkouts },
        { label: 'Revenue', value: `₹${stats.revenue || 0}` },
      ]
    : []

  return (
    <DashboardShell
      title="Admin Dashboard"
      roleLabel="Admin"
      stats={statCards.map((s) => ({ ...s, value: s.value }))}
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

      <DataTable
        title="User Management"
        subtitle="Search by name, email, or phone. Update roles instantly."
        rows={users}
        showPagination={true}
        initialRowsPerPage={20}
        columns={[
          {
            header: 'Name',
            searchKey: (u) => u.name,
            cell: (u) => (
              <span>
                {u.name}
                {u._id === user?._id && (
                  <span style={{ fontSize: '0.75rem', color: '#be185d' }}> (you)</span>
                )}
              </span>
            ),
          },
          { header: 'Email', searchKey: (u) => u.email, cell: (u) => u.email },
          { header: 'Phone', searchKey: (u) => u.phone, cell: (u) => u.phone },
          {
            header: 'Status',
            searchKey: (u) => (u.verified ? 'verified' : 'unverified'),
            cell: (u) => (u.verified ? 'Verified' : 'Unverified'),
          },
          {
            header: 'Role',
            searchKey: (u) => u.role,
            cell: (u) => {
              const currentRole = u.role || 'user'
              return (
                <select
                  value={currentRole}
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
                </select>
              )
            },
          },
          {
            header: 'Joined',
            searchKey: (u) => (u.createdAt ? new Date(u.createdAt).toISOString() : ''),
            cell: (u) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'),
          },
        ]}
      />

      {loading && <p style={{ marginTop: 16 }}>Loading users…</p>}

      {stats && (
        <ChartCards
          stats={[
            { label: 'Users', value: stats.totalUsers },
            { label: 'Verified', value: stats.verifiedUsers },
            { label: 'Admins', value: stats.admins },
            { label: 'Enrollments', value: stats.enrollments },
            { label: 'Messages', value: stats.contacts },
            { label: 'Orders', value: stats.checkouts },
            { label: 'Revenue', value: Number(stats.revenue || 0) },
          ]}
        />
      )}
    </DashboardShell>
  )
}


