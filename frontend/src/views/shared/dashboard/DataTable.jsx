import React, { useMemo, useState } from 'react'

export default function DataTable({
  title,
  subtitle,
  rows,
  columns,
  filterTextPlaceholder = 'Search…',
  searchKeyGetters,
  initialRowsPerPage = 20,
  showPagination = true,
  maxRows,
}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(initialRowsPerPage)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    const getters = searchKeyGetters || columns
      .map((c) => c.searchKey)
      .filter(Boolean)

    return rows.filter((r) => {
      const parts = getters.map((g) => {
        if (typeof g === 'function') return g(r)
        // string key
        return g ? r[g] : undefined
      })
      return parts.some((p) => String(p ?? '').toLowerCase().includes(q))
    })
  }, [rows, query, columns, searchKeyGetters])

  const limited = useMemo(() => {
    if (!maxRows && !showPagination) return filtered
    if (!showPagination) return filtered.slice(0, maxRows ?? initialRowsPerPage)
    return filtered
  }, [filtered, maxRows, showPagination, initialRowsPerPage])

  const paged = useMemo(() => {
    if (!showPagination) return limited
    const start = page * rowsPerPage
    return limited.slice(start, start + rowsPerPage)
  }, [limited, page, rowsPerPage, showPagination])

  const totalPages = showPagination ? Math.max(1, Math.ceil(limited.length / rowsPerPage)) : 1

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 12 }}>
        {title && <h3 style={{ margin: '8px 0 6px' }}>{title}</h3>}
        {subtitle && <p style={{ color: '#6b2a4a', marginBottom: 0 }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div className="search-box-container" style={{ maxWidth: 420, margin: 0 }}>
          <input
            className="search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder={filterTextPlaceholder}
          />
        </div>
        <div style={{ color: '#6b2a4a', fontWeight: 700 }}>
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
        </div>
      </div>

      {paged.length === 0 ? (
        <p style={{ color: '#6b2a4a' }}>No data found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                {columns.map((c) => (
                  <th key={c.header} style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((r) => (
                <tr key={r._id ?? JSON.stringify(r)} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {columns.map((c) => (
                    <td key={c.header} style={{ padding: 8 }}>
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPagination && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 12, flexWrap: 'wrap' }}>
          <button className="btn secondary" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0}>
            ← Prev
          </button>
          <div style={{ color: '#6b2a4a', fontWeight: 800 }}>
            Page {page + 1} / {totalPages}
          </div>
          <button
            className="btn secondary"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

