import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'

export default function DashboardShell({
  title,
  roleLabel,
  breadcrumbs,
  stats,
  children,
  rightHeader,
}) {
  const { signout, user } = useAuth()

  const headerBadgeStyle = useMemo(() => {
    return {
      fontSize: '0.8rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#9d174d',
      background: 'rgba(236, 72, 153, 0.08)',
      padding: '4px 10px',
      borderRadius: 999,
      border: '1px solid rgba(219, 39, 119, 0.15)',
    }
  }, [])

  return (
    <div className="enroll-wrap">
      <div className="container">
        <div className="enroll-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 0 }}>
                {title}
              </h2>
              <div style={{ marginTop: 10 }}>
                <span style={headerBadgeStyle}>{roleLabel}</span>
              </div>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div style={{ marginTop: 10, color: '#6b2a4a', fontWeight: 600, fontSize: '0.95rem' }}>
                  {breadcrumbs.map((b, idx) => (
                    <span key={b.label}>
                      {idx > 0 && <span style={{ margin: '0 10px', opacity: 0.7 }}>›</span>}
                      {b.href ? (
                        <Link to={b.href} style={{ color: '#be185d' }}>
                          {b.label}
                        </Link>
                      ) : (
                        b.label
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {rightHeader}
              <button onClick={signout} className="btn secondary">
                Sign Out
              </button>
            </div>
          </div>

          {stats && stats.length > 0 && (
            <div className="card-grid" style={{ margin: '8px 0 32px' }}>
              {stats.map((s) => (
                <div key={s.label} className="card" style={{ padding: 20 }}>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-title)',
                      background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                    }}
                  >
                    {typeof s.value === 'function' ? s.value(user) : s.value}
                  </div>
                  <div style={{ color: '#6b2a4a', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  )
}

