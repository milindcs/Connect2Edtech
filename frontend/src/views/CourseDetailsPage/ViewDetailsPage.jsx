import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { coursesData, normalizeCourseKey } from '../../shared/coursesData'

export default function ViewDetailsPage() {
  const { course } = useParams()
  const key = normalizeCourseKey(course)
  const data = coursesData[key]

  if (!data) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ color: 'var(--error)', marginBottom: 16 }}>Course Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            We couldn't find the program you were looking for.
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
      <div className="card">
        <h1 style={{ marginBottom: 12 }}>{data.title}</h1>
        <h3 style={{ color: '#666', marginBottom: 20 }}>{data.subtitle}</h3>

        <div style={{ marginBottom: 18 }}>
          <strong>Price:</strong> {data.price === 0 ? 'Free' : `₹${Number(data.price).toFixed(2)}`}
          {data.hr ? <span style={{ marginLeft: 10, color: 'var(--text-muted)' }}>• {data.hr}</span> : null}
        </div>

        <div style={{ marginBottom: 25 }}>
          <strong>Course Details</strong>
          <p style={{ marginTop: 8 }}>{data.description}</p>
        </div>

        <h3>What You'll Learn</h3>
        <ul style={{ marginTop: 20 }}>
          {data.features.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 10 }}>
              ✅ {item}
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: 40,
            display: 'flex',
            gap: 15,
            flexWrap: 'wrap',
          }}
        >
          <Link to="/enrollment" className="btn primary">
            Enroll Now
          </Link>
          <Link to="/courses" className="btn secondary">
            Back to Courses
          </Link>
        </div>
      </div>
    </div>
  )
}

