import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import { API_BASE } from '../../shared/cartApi'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export default function MailPage() {
  const navigate = useNavigate()
  const { isAdmin, isAuthenticated, isStaff, user, token, signout } = useAuth()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeId, setActiveId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    document.title = 'Mail Inbox | Connect2Edtech'
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    } else if (!isStaff) {
      navigate('/')
    }
  }, [isAuthenticated, isStaff, navigate])

  useEffect(() => {
    if (!isStaff || !token) return
    let cancelled = false
    const headers = { Authorization: `Bearer ${token}` }
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(API_BASE + '/api/mail', { headers })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load inbox')
        if (!cancelled) setMessages(data.messages || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load inbox')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isStaff, token])

  const openReply = (m) => {
    setActiveId(m._id)
    setSubject(`Re: your inquiry${m.name ? ` (${m.name})` : ''}`)
    setBody('')
    setToast('')
  }

  const sendReply = async (id) => {
    if (!subject.trim() || !body.trim()) {
      setToast('Subject and message are required.')
      return
    }
    setSending(true)
    setToast('')
    try {
      const res = await fetch(API_BASE + `/api/mail/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: subject.trim(), message: body.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send reply')
      setMessages((prev) => prev.map((m) => (m._id === id ? data.contact : m)))
      setActiveId('')
      setToast('Reply sent.')
    } catch (err) {
      setToast(err.message || 'Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  if (!isAuthenticated || !isStaff) return null

  return (
    <div className="enroll-wrap">
      <div className="container">
        <div className="enroll-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 0 }}>Mail Inbox</h2>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#9d174d', background: 'rgba(236, 72, 153, 0.08)', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(219, 39, 119, 0.15)' }}>Staff</span>
            </div>
            <button onClick={signout} className="btn secondary">Sign Out</button>
          </div>

          {toast && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{toast}</p>}
          {error && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{error}</p>}

          {loading ? (
            <p>Loading…</p>
          ) : messages.length === 0 ? (
            <p style={{ color: '#6b2a4a' }}>No messages in the inbox yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((m) => (
                <div key={m._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong>{m.name || 'Anonymous'}</strong>
                    <span style={{ color: '#9d174d', fontSize: '0.85rem' }}>{formatDate(m.createdAt)}</span>
                  </div>
                  <div style={{ color: '#6b2a4a', fontSize: '0.9rem', marginTop: 4 }}>
                    {m.email || '—'}{m.phone ? ` · ${m.phone}` : ''}
                  </div>
                  <p style={{ color: '#6b2a4a', marginTop: 8 }}>{m.message || '—'}</p>

                  {m.replies && m.replies.length > 0 && (
                    <div style={{ marginTop: 12, padding: 12, background: 'rgba(236, 72, 153, 0.05)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9d174d', textTransform: 'uppercase', marginBottom: 6 }}>Replies</div>
                      {m.replies.map((r, i) => (
                        <div key={i} style={{ fontSize: '0.9rem', color: '#6b2a4a', marginBottom: 6 }}>
                          <strong>{r.from}</strong> · {formatDate(r.at)}
                          <div>{r.body}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeId === m._id ? (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        className="field-label"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border-color)' }}
                      />
                      <textarea
                        placeholder="Write your reply…"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={4}
                        style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border-color)', resize: 'vertical' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn primary" onClick={() => sendReply(m._id)} disabled={sending}>
                          {sending ? 'Sending…' : 'Send Reply'}
                        </button>
                        <button className="btn secondary" onClick={() => setActiveId('')} disabled={sending}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn secondary" style={{ marginTop: 12 }} onClick={() => openReply(m)}>
                      Reply
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
