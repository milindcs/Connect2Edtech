import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { coursesData, normalizeCourseKey } from '../../shared/coursesData'
import { cartAdd } from '../../shared/cartApi'


export default function CourseDetailsPage() {
  const { course: courseParam } = useParams()
  const [course, setCourse] = useState(null)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const key = normalizeCourseKey(courseParam)
    const data = coursesData[key]
    setCourse(data || null)
    
    if (data) {
      document.title = `${data.title} - Course Details`
    } else {
      document.title = 'Course Not Found - Connect2Edtech'
    }
  }, [courseParam])

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  const handleAddToCart = async () => {

    if (!course) return
    try {
      await cartAdd({
        courseKey: course.key,
        title: course.title,
        price: course.price,
        image: course.image || '',
      })
      window.dispatchEvent(new Event('cart-updated'))
      showToast(`Added ${course.title} to your cart!`, 'success')
    } catch (e) {
      console.error(e)
      showToast('Could not add to cart. Please try again.', 'error')
    }
  }


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

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="detail-shell">
        <section className="detail-hero">
          <h1 id="detail-title">{course.title} Details</h1>
          <p id="detail-subtitle">{course.subtitle}</p>
        </section>

        <section className="detail-body">
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
              </div>
            </div>

            <aside className="card" aria-label="Course Summary" style={{ width: '100%' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Enrollment Info</h3>
              <div className="price-tag" id="detail-price">
                {course.price === 0 ? 'Free' : `₹${course.price.toFixed(2)}`}
              </div>
              <p className="hint" id="detail-meta" style={{ marginBottom: 20 }}>
                Category: {course.meta}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  id="addToCartBtn"
                  type="button"
                  className="btn primary"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
                <Link
                  id="enrollFromDetail"
                  to="/enrollment"
                  className="btn secondary"
                  style={{ textAlign: 'center' }}
                >
                  Enroll Now
                </Link>
              </div>
            </aside>
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
