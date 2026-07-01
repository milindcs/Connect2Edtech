import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { buildWhatsAppUrl, cleanText } from '../../shared/whatsappUtils'

export default function ReceiveCertificatePage() {
  const [formData, setFormData] = useState({
    decision: '',
    name: '',
    email: '',
    certificate_email: '',
    phone: '',
    certificate_type: '',
    program: '',
    student_id: '',
    year: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    document.title = 'Receive Your Certificate | Connect2Edtech'
  }, [])

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const params = new URLSearchParams()
      params.append('decision', formData.decision)
      params.append('name', formData.name)
      params.append('email', formData.email)
      params.append('certificate_email', formData.certificate_email)
      params.append('phone', formData.phone)
      params.append('certificate_type', formData.certificate_type)
      params.append('program', formData.program)
      params.append('student_id', formData.student_id)
      params.append('year', formData.year)
      params.append('message', formData.message)

      const msgParts = [
        '📜 Certificate Request',
        `Decision: ${cleanText(formData.decision)}`,
        `Name: ${cleanText(formData.name)}`,
        `Email: ${cleanText(formData.email)}`,
        `Delivery Email: ${cleanText(formData.certificate_email)}`,
        formData.phone ? `Phone: ${cleanText(formData.phone)}` : null,
        `Certificate Type: ${cleanText(formData.certificate_type)}`,
        `Program: ${cleanText(formData.program)}`,
        formData.student_id ? `Student ID: ${cleanText(formData.student_id)}` : null,
        formData.year ? `Year: ${cleanText(formData.year)}` : null,
        formData.message ? `Details: ${cleanText(formData.message)}` : null
      ].filter(Boolean)

      let whatsappUrl = buildWhatsAppUrl(msgParts.join('\n'))

      const res = await fetch('/send-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })

      const data = await res.json().catch(() => ({}))
      if (data.whatsappUrl) {
        whatsappUrl = data.whatsappUrl
      }

      showToast('Certificate request sent! Opening WhatsApp...', 'success')
      setTimeout(() => {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      }, 800)
      setResult({ success: true, message: 'Certificate request sent! Check WhatsApp for confirmation.' })
      setFormData({
        decision: '',
        name: '',
        email: '',
        certificate_email: '',
        phone: '',
        certificate_type: '',
        program: '',
        student_id: '',
        year: '',
        message: ''
      })
    } catch (err) {
      console.error(err)
      setResult({
        success: false,
        message: 'Could not submit request. Please try again or contact support.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="receive-wrap">
      <div className="container">
        <Link to="/verify-certificate" className="verify-back">
          &larr; Back to Verification Dashboard
        </Link>

        <div className="verify-hero" style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 className="section-title">Verify Certificate & Send to Student</h1>
          <p className="section-subtitle">
            Submit certificate details for verification and provide the student email where the certificate should be delivered.
          </p>
        </div>

        <div className="verify-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: 32, maxWidth: 750, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', textAlign: 'center', color: '#a5b4fc', marginBottom: 20 }}>
            Certificate Request Form
          </h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32 }}>
            Submit details below. Our team will verify the credentials and dispatch the certificate.
          </p>

          <form id="receiveForm" className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span className="field-label">Verification Decision</span>
              <select name="decision" required value={formData.decision} onChange={handleInputChange}>
                <option value="">Select decision</option>
                <option value="Approved">Approve</option>
                <option value="Rejected">Reject</option>
              </select>
            </label>

            <label>
              <span className="field-label">Full Name (as on certificate)</span>
              <input name="name" required placeholder="Enter full name" value={formData.name} onChange={handleInputChange} />
            </label>

            <label>
              <span className="field-label">Your Email</span>
              <input name="email" required type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} />
            </label>

            <label>
              <span className="field-label">Email to Receive Certificate</span>
              <input
                name="certificate_email"
                required
                type="email"
                placeholder="certificate@example.com"
                value={formData.certificate_email}
                onChange={handleInputChange}
              />
            </label>

            <label>
              <span className="field-label">Phone Number</span>
              <input name="phone" type="tel" placeholder="+91 7019436720" value={formData.phone} onChange={handleInputChange} />
            </label>

            <label>
              <span className="field-label">Certificate Type</span>
              <select name="certificate_type" required value={formData.certificate_type} onChange={handleInputChange}>
                <option value="">Select certificate type</option>
                <option value="Course Completion Certificate">Course Completion Certificate</option>
                <option value="Internship Certification">Internship Certification</option>
                <option value="Industry Certification">Industry Certification</option>
              </select>
            </label>

            <label>
              <span className="field-label">Program / Course Name</span>
              <input name="program" required placeholder="e.g. Full Stack Web Development" value={formData.program} onChange={handleInputChange} />
            </label>

            <label>
              <span className="field-label">Student / Enrollment ID</span>
              <input name="student_id" placeholder="Enter student or enrollment ID" value={formData.student_id} onChange={handleInputChange} />
            </label>

            <label>
              <span className="field-label">Year of Issuance</span>
              <input
                name="year"
                type="number"
                placeholder="e.g. 2026"
                min="2000"
                max="2099"
                value={formData.year}
                onChange={handleInputChange}
              />
            </label>

            <label>
              <span className="field-label">Additional Details</span>
              <textarea
                name="message"
                rows={4}
                placeholder="Share any certificate details or verification notes..."
                value={formData.message}
                onChange={handleInputChange}
              />
            </label>

            <div className="form-actions" style={{ marginTop: 12 }}>
              <button type="submit" className="btn primary" style={{ flexGrow: 1 }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Certificate'}
              </button>
              <Link to="/verify-certificate" className="btn secondary">
                Cancel
              </Link>
            </div>
          </form>

          {result && (
            <div
              className={`verify-result ${result.success ? 'success' : 'error'}`}
              style={{ marginTop: 24, display: 'block', padding: 12, borderRadius: 8, fontSize: '0.88rem' }}
            >
              {result.message}
            </div>
          )}
        </div>
      </div>

      {/* Toast Overlay */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast show ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}