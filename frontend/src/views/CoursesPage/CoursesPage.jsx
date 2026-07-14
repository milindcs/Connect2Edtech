import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { coursesData } from '../../shared/coursesData'
import { enrollmentSubmit } from '../../shared/cartApi'
import { useAuth } from '../../shared/AuthContext'
import { useToast } from '../../shared/useToast'

export default function CoursesPage() {
  const { user } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedCourses, setSelectedCourses] = useState([])
  const [adding, setAdding] = useState(false)
  const [addedCount, setAddedCount] = useState(0)

  useEffect(() => {
    document.title = 'Courses - Core Technology Domains'
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
  }, [])

  const categories = [
    { id: 'all', label: 'All Programs' },
    { id: 'technical', label: 'Technical' },
    { id: 'nontechnical', label: 'Non-Technical' },
    { id: 'special', label: 'Special Programs' }
  ]

  const getCategoryForCourse = (key) => {
    if (['webdev', 'datascience', 'security', 'ai1000', 'mern', 'java', 'bigdata', 'cyber', 'pythonfullstack', 'cpp2000', 'technical'].includes(key)) {
      return 'technical';
    }
    if (['nontechnical', 'nontechplus', 'placement', 'aptitude', 'softskills'].includes(key)) {
      return 'nontechnical';
    }
    return 'special';
  }


  const filteredCourses = Object.values(coursesData).filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.subtitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === 'all' || getCategoryForCourse(c.key) === activeCategory;

    return matchesSearch && matchesCategory;
  })

  const toggleCourse = (key) => {
    setSelectedCourses((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleAddSelectedToCart = async () => {
    if (selectedCourses.length === 0) return
    setAdding(true)
    setAddedCount(0)
    try {
      const selected = filteredCourses.filter((c) => selectedCourses.includes(c.key))
      const name = String(user?.name || '').trim()
      const email = String(user?.email || '').trim()
      const phone = String(user?.phone || '').trim()
      if (!name || !email || !phone) {
        showToast('Please complete your profile with name, email, and phone before enrolling.', 'error')
        return
      }

      await Promise.all(
        selected.map((c) =>
          enrollmentSubmit({
            name,
            email,
            phone,
            courseKey: c.key,
            courseTitle: c.title,
            message: `Enrolled from courses page`,
          })
        )
      )
      setAddedCount(selected.length)
      setTimeout(() => setAddedCount(0), 2000)
      setSelectedCourses([])
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Failed to enroll selected courses.', 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <section className="detail-hero animate-on-scroll animate-fade-up" style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: 12 }}>Campus Training Programs</h1>
        <p className="section-subtitle">
          College-partnership programs designed for on-campus training, real projects, and placement outcomes.
        </p>
      </section>

      {/* Search and Filters */}
      <div className="search-box-container">
        <input
          type="text"
          placeholder="Search courses..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid listing */}
      {filteredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.2rem' }}>No programs found matching your filters.</p>
        </div>
      ) : (
      <div className="card-grid">
            {filteredCourses.map((c) => (
              <div key={c.key} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(c.key)}
                    onChange={() => toggleCourse(c.key)}
                    style={{ marginTop: 6, width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <Link to={`/course/${c.key}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                    <div className="card-number">
                      {c.price === 0 ? 'Free Training' : `₹${c.price}`}
                    </div>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: 8 }}>{c.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>{c.meta}</p>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 20 }}>{c.subtitle}</p>

                    <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                      {c.features.slice(0, 3).map((f, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'var(--border-focus)' }}>✦</span> {f}
                        </li>
                      ))}
                      {c.features.length > 3 && (
                        <li style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          + {c.features.length - 3} more modules
                        </li>
                      )}
                    </ul>
                  </Link>
                </div>

                <div className="card-actions" style={{ marginTop: 'auto' }}>
                  <Link
                    to={`/course/${c.key}`}
                    className="btn primary"
                    style={{ flexGrow: 1, textAlign: 'center' }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
      )}

      {selectedCourses.length > 0 && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', position: 'sticky', bottom: 16, zIndex: 10 }}>
          <button
            className="btn primary"
            onClick={handleAddSelectedToCart}
            disabled={adding}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {adding ? 'Enrolling...' : `Enroll ${selectedCourses.length} Selected`}
          </button>
          {addedCount > 0 && (
            <span style={{ color: 'green', fontWeight: 700, alignSelf: 'center' }}>
              ✓ Enrolled {addedCount} course(s)
            </span>
          )}
        </div>
      )}

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link to="/" className="btn secondary">← Back to Home</Link>
      </div>

      {ToastContainer}
    </div>
  )
}