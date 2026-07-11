import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { coursesData, normalizeCourseKey } from '../../shared/coursesData'
import { enrollmentSubmit } from '../../shared/cartApi'

export default function EnrollmentPage() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const courseParam = queryParams.get('course') || ''

  const [course, setCourse] = useState(null)
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('enrollment_form_data')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return {
      fullName: '',
      email: '',
      phone: '',
      college: '',
      agreeToTerms: false
    }
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = course ? `Enroll in ${course.title} - Connect2Edtech` : 'Program Enrollment - Connect2Edtech'
  }, [course])

  useEffect(() => {
    if (courseParam) {
      const key = normalizeCourseKey(courseParam)
      const data = coursesData[key]
      setCourse(data || null)
    }

    const sections = document.querySelectorAll('.animate-on-scroll')
    if (!('IntersectionObserver' in window)) {
      sections.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [courseParam])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value }
      localStorage.setItem('enrollment_form_data', JSON.stringify(next))
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.fullName || !formData.email || !formData.phone) {
      setError('Please fill in all mandatory fields.')
      return
    }

    if (!formData.agreeToTerms) {
      setError('You must accept the training regulations to proceed.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      await enrollmentSubmit({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        courseKey: course ? course.key : '',
        courseTitle: course ? course.title : '',
        message: formData.college ? `College: ${formData.college}` : ''
      })

      localStorage.removeItem('enrollment_form_data')
      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not submit enrollment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="detail-shell" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
          <h2 style={{ color: 'var(--border-focus)', marginBottom: 16 }}>Enrollment Received!</h2>
          <p style={{ color: 'var(--text-primary)', marginBottom: 12, fontSize: '1.1rem' }}>
            You have successfully initiated enrollment for <strong>{course ? course.title : 'the program'}</strong>.
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.95rem', lineHeight: '1.6' }}>
            An onboarding confirmation overview has been sent to <strong>{formData.email}</strong>. Our training coordinator team will review your profile credentials and follow up with you shortly.
          </p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <Link to="/courses" className="btn primary">
              Browse More Programs
            </Link>
            <Link to="/" className="btn secondary">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="detail-shell" style={{ maxWidth: 960, margin: '0 auto' }}>
        
        <section className="detail-hero animate-on-scroll animate-fade-up" style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: 12 }}>Training Track Enrollment</h1>
          <p className="section-subtitle">
            Provide your academic profile information below to register your seat and initialize your learning module timeline.
          </p>
        </section>

        <div className="two-col animate-on-scroll animate-slide stagger-2" style={{ gap: 40 }}>
          
          <form className="card" onSubmit={handleSubmit} style={{ width: '100%', padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Applicant Context</h3>
            
            {error && (
              <div style={{ color: 'var(--error)', backgroundColor: 'rgba(236, 72, 153, 0.08)', padding: '12px 16px', borderRadius: 6, fontSize: '0.9rem', border: '1px solid var(--error)' }}>
                {error}
              </div>
            )}

            {course && (
              <div style={{ background: 'rgba(219, 39, 119, 0.05)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, marginBottom: 8 }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '1rem' }}>Selected Track</h4>
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>{course.title}</strong> — {course.price === 0 ? 'Free' : `₹${Number(course.price).toFixed(2)}`}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="fullName" style={{ fontWeight: '500', fontSize: '0.9rem' }}>Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="search-input"
                style={{ width: '100%', margin: 0 }}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="email" style={{ fontWeight: '500', fontSize: '0.9rem' }}>Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                className="search-input"
                style={{ width: '100%', margin: 0 }}
                placeholder="student@domain.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="phone" style={{ fontWeight: '500', fontSize: '0.9rem' }}>Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="search-input"
                style={{ width: '100%', margin: 0 }}
                placeholder="Enter your 10-digit mobile number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="college" style={{ fontWeight: '500', fontSize: '0.9rem' }}>College / Institution Name</label>
              <input
                type="text"
                id="college"
                name="college"
                className="search-input"
                style={{ width: '100%', margin: 0 }}
                placeholder="Specify your campus institution"
                value={formData.college}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 10 }}>
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                style={{ marginTop: 4, cursor: 'pointer' }}
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
              />
              <label htmlFor="agreeToTerms" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer', lineHeight: '1.4' }}>
                I authorize Connect2Edtech to log my assignment metrics, process mentor checkpoints, and track my attendance profile through the program duration.
              </label>
            </div>

            <button type="submit" className="btn primary" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Confirm & Lock Registration'}
            </button>
          </form>

          <aside style={{ width: '100%', maxWidth: 360 }}>
            {course ? (
              <div className="card" style={{ padding: 24, position: 'sticky', top: 24 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Selected Track</h3>
                
                {course.image && (
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} 
                  />
                )}
                
                <h4 style={{ fontSize: '1.3rem', marginBottom: 4 }}>{course.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  {course.meta}{course.hr && ` • ${course.hr}`}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 20, lineHeight: '1.5' }}>
                  {course.subtitle}
                </p>
                
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 16 }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Program Cost:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {course.price === 0 ? 'Free' : `₹${Number(course.price).toFixed(2)}`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                  No target training program is currently configured from your tracking selection. Fill out a general profile here, or back up to choose a structured curriculum path.
                </p>
                <Link to="/courses" className="btn secondary" style={{ marginTop: 20, display: 'inline-block' }}>
                  Browse All Courses
                </Link>
              </div>
            )}
          </aside>

        </div>
      </div>
    </div>
  )
}
