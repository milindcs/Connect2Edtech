import React, { useMemo, useState, useCallback } from 'react'

const getRowId = (r, index) => r?._id ?? r?.id ?? index

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
  selectable = false,
  onSelectionChange,
  emptyMessage = 'No data found.',
}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

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

  const rowIdOf = useCallback((r) => getRowId(r, rows.indexOf(r)), [rows])

  const emitSelection = useCallback((nextSet) => {
    setSelectedIds(nextSet)
    if (onSelectionChange) {
      const selectedRows = rows.filter((r) => nextSet.has(rowIdOf(r)))
      onSelectionChange(selectedRows, nextSet)
    }
  }, [rows, rowIdOf, onSelectionChange])

  const filteredIds = useMemo(() => filtered.map((r) => rowIdOf(r)), [filtered, rowIdOf])
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id))
  const someFilteredSelected = filteredIds.some((id) => selectedIds.has(id))

  const toggleSelectAll = useCallback(() => {
    const next = new Set(selectedIds)
    if (allFilteredSelected) {
      filteredIds.forEach((id) => next.delete(id))
    } else {
      filteredIds.forEach((id) => next.add(id))
    }
    emitSelection(next)
  }, [selectedIds, filteredIds, allFilteredSelected, emitSelection])

  const toggleRow = useCallback((id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    emitSelection(next)
  }, [selectedIds, emitSelection])

  const handlePageChange = useCallback((newPage) => {
    setPage((p) => Math.max(0, Math.min(totalPages - 1, newPage)))
  }, [totalPages])

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
            aria-label={filterTextPlaceholder}
          />
        </div>
        <div style={{ color: '#6b2a4a', fontWeight: 700 }} aria-live="polite">
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
        </div>
        {selectable && selectedIds.size > 0 && (
          <div style={{ color: '#9d174d', fontWeight: 700 }}>
            {selectedIds.size} selected
          </div>
        )}
      </div>

      {paged.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6b2a4a' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>{emptyMessage}</p>
          {query && (
            <p style={{ marginTop: 8, fontSize: '0.9rem' }}>
              Try adjusting your search query
            </p>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} role="grid">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                {selectable && (
                  <th style={{ textAlign: 'left', padding: 8, width: 36 }} scope="col">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allFilteredSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = !allFilteredSelected && someFilteredSelected
                      }}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                {columns.map((c) => (
                  <th key={c.header} style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }} scope="col">
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((r) => {
                const id = rowIdOf(r)
                return (
                  <tr key={id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {selectable && (
                      <td style={{ padding: 8, width: 36 }}>
                        <input
                          type="checkbox"
                          aria-label={`Select row ${id}`}
                          checked={selectedIds.has(id)}
                          onChange={() => toggleRow(id)}
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.header} style={{ padding: 8 }}>
                        {c.cell(r)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showPagination && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 12, flexWrap: 'wrap' }}>
          <button 
            className="btn secondary" 
            onClick={() => handlePageChange(page - 1)} 
            disabled={page <= 0}
            aria-label="Go to previous page"
          >
            ← Prev
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="rows-per-page" style={{ color: '#6b2a4a', fontWeight: 800, fontSize: '0.9rem' }}>
              Rows per page:
            </label>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setPage(0)
              }}
              style={{
                padding: '4px 8px',
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                background: '#fff',
                color: '#6b2a4a',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div style={{ color: '#6b2a4a', fontWeight: 800 }}>
            Page {page + 1} / {totalPages}
          </div>
          <button
            className="btn secondary"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            aria-label="Go to next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

