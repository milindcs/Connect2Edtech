import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { coursesData, normalizeCourseKey } from '../../shared/coursesData'


export default function CourseDetailsPage() {
  const { course: courseParam } = useParams()
  const [course, setCourse] = useState(null)

  useEffect(() => {
    const key = normalizeCourseKey(courseParam)
    const data = coursesData[key]
    setCourse(data || null)

    if (data) {
      document.title = `${data.title} - Course Details`
    } else {
      document.title = 'Course Not Found - Connect2Edtech'
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



  if (!course) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="detail-body" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ color: 'var(--error)', marginBottom: 16 }}>Course Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            We couldn't find the course you were looking for. It may have been renamed or moved.
          </p>
          <Link to="/courses" className="btn primary">
            Browse All Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="detail-shell">
        <section className="detail-hero animate-on-scroll animate-fade-up">
          <h1 id="detail-title">{course.title} Details</h1>
          <p id="detail-subtitle">{course.subtitle}</p>
        </section>

        <section className="detail-body animate-on-scroll animate-slide stagger-2">
          <div className="two-col">
            <div>
              {course.image && (
                <img
                  id="detail-image"
                  className="detail-image"
                  src={course.image}
                  alt={course.title}
                />
              )}
              <p className="section-description" style={{ textAlign: 'left', margin: '0 0 24px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {course.description}
              </p>

              <h3 style={{ fontSize: '1.4rem', marginBottom: 16 }}>What you will learn</h3>
              <ul className="feature-list" id="detail-features">
                {course.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>

              <div className="btn-row" style={{ marginTop: 24 }}>
                <Link to="/courses" className="btn secondary">
                  ← Back to Courses
                </Link>
                <Link to="/" className="btn secondary">
                  ← Back to Home
                </Link>
              </div>
            </div>

            <aside className="card" aria-label="Course Summary" style={{ width: '100%' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Enrollment Info</h3>
              <div className="price-tag" id="detail-price">
                {course.price === 0 ? 'Free' : `₹${Number(course.price).toFixed(2)}`}
              </div>
              <p className="hint" id="detail-meta" style={{ marginBottom: 20 }}>
                Category: {course.meta}{course.hr && ` • ${course.hr}`}
              </p>

               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 <Link
                   id="enrollFromDetail"
                   to="/enrollment"
                   className="btn primary"
                   style={{ textAlign: 'center' }}
                 >
                   Enroll Now
                 </Link>
               </div>
            </aside>
          </div>
        </section>
      </div>

    </div>
  )
}
