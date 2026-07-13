import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../shared/api'

export default function VerifyCertificatePage() {
  const { id } = useParams()
  const [status, setStatus] = useState('loading')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Verify Certificate - Connect2Edtech'
  }, [])

  useEffect(() => {
    if (!id) {
      setStatus('error')
      setError('Missing certificate id.')
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await api.get(`/api/certificates/${encodeURIComponent(id)}/verify`)
        if (!cancelled) {
          setData(res.data)
          setStatus('success')
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setError(err.response?.data?.error || err.message || 'Verification failed.')
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div className="detail-shell" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
        <h2 style={{ marginBottom: 16 }}>Certificate Verification</h2>

        {status === 'loading' && <p>Verifying certificate…</p>}

        {status === 'success' && data && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ padding: 16, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: 8, marginBottom: 16 }}>
              <strong>Valid Certificate</strong>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div><strong>Name:</strong> {data.userName || '—'}</div>
              <div><strong>Email:</strong> {data.userEmail || '—'}</div>
              <div><strong>Course:</strong> {data.courseTitle || data.courseKey || '—'}</div>
              <div><strong>Issued:</strong> {data.issuedAt ? new Date(data.issuedAt).toLocaleDateString() : '—'}</div>
              <div><strong>Certificate ID:</strong> {data.certificateId || data._id || '—'}</div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ padding: 16, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 8, marginBottom: 16 }}>
              <strong>Invalid or Not Found</strong>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Link to="/" className="btn secondary">Return Home</Link>
        </div>
      </div>
    </div>
  )
}
