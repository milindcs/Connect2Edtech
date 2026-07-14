import React from 'react'

function SparkBar({ value, max, color = '#ec4899', animated = true }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <div
        style={{
          width: 14,
          height: 120,
          borderRadius: 10,
          background: 'rgba(236, 72, 153, 0.12)',
          border: '1px solid rgba(236, 72, 153, 0.25)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: `${pct}%`,
            background: `linear-gradient(180deg, ${color} 0%, rgba(219, 39, 119, 0.9) 100%)`,
            transition: animated ? 'height 0.6s ease-out' : 'none',
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#9d174d' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#6b2a4a', fontWeight: 700 }}>Peak</div>
      </div>
    </div>
  )
}

/**
 * Lightweight “charts” without external deps.
 * stats: [{label,value,trend?,color?}]
 */
export default function ChartCards({ stats, animated = true }) {
  if (!stats || stats.length === 0) {
    return (
      <div style={{ marginTop: 24, textAlign: 'center', padding: 24, color: '#6b2a4a' }}>
        <p>No stats available at this time.</p>
      </div>
    )
  }
  const max = Math.max(...stats.map((s) => Number(s.value) || 0), 1)

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ marginBottom: 12, color: '#111827' }}>Quick Insights</h3>
      <div className="card-grid" style={{ marginTop: 0, marginBottom: 0 }}>
        {stats.map((s, idx) => (
          <div key={s.label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ec4899', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: 6, color: '#111827' }}>{s.value}</div>
              </div>
              <div style={{ fontSize: '1.25rem' }}>{['📈','🧾','💬','👥','💰','✅'][idx % 6]}</div>
            </div>
            <div style={{ marginTop: 14 }}>
              <SparkBar value={Number(s.value) || 0} max={max} color={s.color} animated={animated} />
            </div>
            {s.trend && (
              <div style={{ 
                marginTop: 8, 
                fontSize: '0.8rem', 
                fontWeight: 600,
                color: s.trend > 0 ? 'green' : s.trend < 0 ? 'red' : '#6b2a4a'
              }}>
                {s.trend > 0 ? '↑' : s.trend < 0 ? '↓' : '→'} {Math.abs(s.trend)}% change
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

