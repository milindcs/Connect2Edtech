import React from 'react'

function SparkBar({ value, max, color = '#ec4899' }) {
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
 * stats: [{label,value}]
 */
export default function ChartCards({ stats }) {
  if (!stats || stats.length === 0) return null
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
              <SparkBar value={Number(s.value) || 0} max={max} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

