import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { coursesData } from '../../shared/coursesData'
import { cartAdd } from '../../shared/cartApi'


export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    document.title = 'Courses - Core Technology Domains'
  }, [])

  const categories = [
    { id: 'all', label: 'All Programs' },
    { id: 'technical', label: 'Technical' },
    { id: 'nontechnical', label: 'Non-Technical' },
    { id: 'special', label: 'Special Programs' }
  ]

  const getCategoryForCourse = (key) => {
    if (['webdev', 'datascience', 'security', 'aptitude', 'softskills', 'ai1000', 'mern', 'java', 'bigdata', 'cyber', 'pythonfullstack', 'cpp2000', 'technical'].includes(key)) {
      return 'technical';
    }
    if (['nontechnical', 'nontechplus', 'placement'].includes(key)) {
      return 'nontechnical';
    }
    return 'special';
  }

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  const handleAddToCart = async (course) => {

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


  const filteredCourses = Object.values(coursesData).filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || getCategoryForCourse(c.key) === activeCategory;
    
    return matchesSearch && matchesCategory;
  })

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <section className="detail-hero animate-on-scroll animate-fade-up" style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: '3rem', marginBottom: 12 }}>Campus Training Programs</h1>
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
        <div className="card-grid animate-on-scroll animate-slide stagger-3">
          {filteredCourses.map((c) => (
            <div className="card" key={c.key} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="card-number">
                {c.price === 0 ? 'Free Training' : `₹${c.price}`}
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: 8 }}>{c.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>{c.meta}</p>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 20 }}>{c.subtitle}</p>
              
              <ul style={{ listStyle: 'none', marginBottom: 24, flexGrow: 1 }}>
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

              <div className="card-actions" style={{ marginTop: 'auto' }}>
                <button
                  type="button"
                  className="btn primary"
                  style={{ flexGrow: 1 }}
                  onClick={() => handleAddToCart(c)}
                >
                  Add to Cart
                </button>
                <Link
                  to={`/course/${c.key}`}
                  className="btn secondary"
                  style={{ textAlign: 'center' }}
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Alerts Overlay */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast show ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link to="/" className="btn secondary">← Back to Home</Link>
      </div>
    </div>
  )
}
