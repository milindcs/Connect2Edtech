import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { buildWhatsAppUrl, cleanText } from '../../shared/whatsappUtils'

export default function VerifyCertificatePage() {
  const [formData, setFormData] = useState({
    decision: '',
    name: '',
    email: '',
    certificate_email: 'connect2future.main@gmail.com',
    cc_email: '',
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
    document.title = 'Verify Certificate & Send to Student | Connect2Edtech'
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const handleDownloadPreview = () => {
    const n = formData.name.trim()
    const p = formData.program.trim()
    const t = formData.certificate_type.trim()
    const y = formData.year.trim()
    const stamp = new Date().toISOString().slice(0, 10)

    const content = `CONNECT2EDTECH\n\nCertificate of Completion\n\nThis is to certify that\n${n || '—'}\n\nhas successfully completed\n${t || '—'}\n\nProgram: ${p || '—'}\nYear: ${y || '—'}\n\nIssued by: Connect2Edtech\nDate: ${stamp}\n`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Certificate_${(n || 'Student').replace(/\s+/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('Certificate preview downloaded!', 'success')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const params = new URLSearchParams()
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, value)
      })
      params.append('_subject', 'Certificate Request - Connect2Edtech')
      params.append('inquiry_type', 'Certificate Request')

      const res = await fetch('/send-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      })

      const data = await res.json().catch(() => ({}))

      if (data.whatsappUrl) {
        setResult({
          success: true,
          message: `Certificate request ready. Opening WhatsApp to confirm delivery to ${formData.certificate_email}...`
        })
        showToast('Certificate request ready! Opening WhatsApp...', 'success')
        setTimeout(() => {
          window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer')
        }, 800)
      } else if (!res.ok) {
        throw new Error('Certificate request failed')
      } else {
        setResult({
          success: true,
          message: `Request sent successfully. If approved, the certificate will be delivered to ${formData.certificate_email}.`
        })
        showToast('Certificate request sent successfully!', 'success')
      }

      setFormData({
        decision: '',
        name: '',
        email: '',
        certificate_email: 'connect2future.main@gmail.com',
        cc_email: '',
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
        message: 'Could not send request. Please try again.'
      })
      showToast('Could not send verification request. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verify-page container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <Link to="/certifications" className="verify-back">
        &larr; Back to Certifications
      </Link>

      <div className="verify-hero" style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 className="section-title">Verify Certificate & Send to Student</h1>
        <p className="section-subtitle">
          Submit certificate details for verification and provide the student email where the certificate should be delivered.
        </p>
      </div>

      <div className="verify-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: 32, maxWidth: 750, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.6rem', textAlign: 'center', color: '#a5b4fc', marginBottom: 20 }}>
          Certificate Verification & Delivery Form
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32 }}>
          Submit details below. Our team will verify the credentials and dispatch the certificate to the student.
        </p>

        <form id="verifyForm" className="form-grid" onSubmit={handleSubmit}>
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
              placeholder="connect2future.main@gmail.com"
              value={formData.certificate_email}
              onChange={handleInputChange}
            />
          </label>

          <label>
            <span className="field-label">Also Send Copy To (optional)</span>
            <input name="cc_email" type="email" placeholder="optional@example.com" value={formData.cc_email} onChange={handleInputChange} />
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
            <button type="submit" className="btn primary" disabled={loading} style={{ flexGrow: 1 }}>
              {loading ? 'Sending...' : 'Accept & Send Request'}
            </button>
            <Link to="/certifications" className="btn secondary">
              Cancel
            </Link>
          </div>
        </form>

        {result && (
          <div className={`verify-result ${result.success ? 'success' : 'error'}`} style={{ marginTop: 24, display: 'block' }}>
            {result.message}
          </div>
        )}

        <section aria-label="Certificate preview" style={{ marginTop: 40, borderTop: '1px solid var(--border-color)', paddingTop: 32 }}>
          <h3 style={{ textAlign: 'center', color: '#a5b4fc', marginBottom: 8, fontSize: '1.25rem' }}>
            Certificate Live Preview
          </h3>
          <p className="hint" style={{ textAlign: 'center', marginBottom: 20 }}>
            Generates instantly below. Download locally without sending an email request.
          </p>

          <div
            style={{
              maxWidth: 600,
              margin: '0 auto 20px auto',
              padding: 24,
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--border-radius)',
              background: 'rgba(255,255,255,0.01)',
            }}
          >
            <div style={{ fontFamily: "var(--font-title)", color: 'var(--text-white)' }}>
              <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 24, letterSpacing: '0.05em', color: '#818cf8', marginBottom: 8 }}>
                CONNECT2EDTECH
              </div>
              <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>
                Certificate of Completion
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                This is to certify that
              </div>
              <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 26, color: 'var(--text-white)', marginBottom: 16, fontFamily: "var(--font-title)" }}>
                {formData.name.trim() || '—'}
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                has successfully completed the requirements for
              </div>
              <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, color: '#ec4899', marginBottom: 16 }}>
                {formData.certificate_type || '—'}
              </div>
              <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
                Program: <strong style={{ color: 'var(--text-white)' }}>{formData.program.trim() || '—'}</strong>
              </div>
              <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-primary)', marginBottom: 32 }}>
                Year of Issuance: <strong style={{ color: 'var(--text-white)' }}>{formData.year.trim() || '—'}</strong>
              </div>
              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                Issued by Connect2Edtech Onboarding Administration
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn primary" onClick={handleDownloadPreview}>
              Download Preview Text
            </button>
            <Link to="/receive-certificate" className="btn secondary">
              Receive Certificate Flow
            </Link>
          </div>
        </section>
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
