import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { coursesData } from '../../shared/coursesData'

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const sync = async () => {
      try {
        // Cart is server-backed; just count items.
        const { cartList } = await import('../../shared/cartApi.js')
        const res = await cartList()
        const items = Array.isArray(res?.items) ? res.items : []
        setCartCount(items.length)
      } catch {
        setCartCount(0)
      }
    }


    sync()
    window.addEventListener('cart-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('cart-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const featuredCourses = useMemo(() => Object.values(coursesData).slice(0, 6), [])

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <h1>Empowering Students with Industry-Ready Skills</h1>
          <p>
            Learn Today. Lead Tomorrow. Explore technical, non-technical, business, and emerging technology
            programs designed for career success.
          </p>
          <div className="hero-buttons">
            <Link to="/courses" className="btn primary">Explore Courses</Link>
            <Link to="/enrollment" className="btn primary">Enroll Now</Link>
            <Link to="/contact" className="btn secondary">Contact Us</Link>
          </div>
          <img className="hero-image" src="/assets/untitled design.jpg" alt="Hero Design" />
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Quick Access</h2>
          <p className="section-subtitle">Jump directly to any Connect2Edtech page from the homepage.</p>

          <div className="hub-grid">
            <Link to="/about" className="hub-card">
              <span className="hub-icon">ℹ️</span>
              <div className="hub-content">
                <h3>About Us</h3>
                <p>Learn about our vision, team, and training philosophy.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/courses" className="hub-card">
              <span className="hub-icon">💻</span>
              <div className="hub-content">
                <h3>Courses</h3>
                <p>Browse all course offerings and full program details.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/enrollment" className="hub-card">
              <span className="hub-icon">📝</span>
              <div className="hub-content">
                <h3>Enrollment</h3>
                <p>Complete enrollment steps to reserve your seat in a course.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/cart" className="hub-card">
              <span className="hub-icon">🛒</span>
              <div className="hub-content">
                <h3>Cart</h3>
                <p>Review selected courses and prepare for checkout.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/checkout" className="hub-card">
              <span className="hub-icon">💳</span>
              <div className="hub-content">
                <h3>Checkout</h3>
                <p>Complete your payment and secure your enrollment.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/contact" className="hub-card">
              <span className="hub-icon">📞</span>
              <div className="hub-content">
                <h3>Contact</h3>
                <p>Get in touch with our team for questions and support.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/certifications" className="hub-card">
              <span className="hub-icon">✅</span>
              <div className="hub-content">
                <h3>Certifications</h3>
                <p>Find certification programs and verification options.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/verify-certificate" className="hub-card">
              <span className="hub-icon">🔍</span>
              <div className="hub-content">
                <h3>Verify Certificate</h3>
                <p>Check the authenticity of issued credential documents.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/receive-certificate" className="hub-card">
              <span className="hub-icon">📄</span>
              <div className="hub-content">
                <h3>Receive Certificate</h3>
                <p>Request and download your completion or internship certificates.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/signup" className="hub-card">
              <span className="hub-icon">🧑‍🎓</span>
              <div className="hub-content">
                <h3>Sign Up</h3>
                <p>Create your student account and access our platform.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Why Choose Connect2Edtech</h2>
          <p className="section-subtitle">We bridge the gap between academic learning and industry requirements.</p>

          <div className="hub-grid">
            <Link to="/certifications" className="hub-card">
              <span className="hub-icon">🎓</span>
              <div className="hub-content">
                <h3>Verifiable Certifications</h3>
                <p>Industry-recognized credentials you can share with employers.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/courses" className="hub-card">
              <span className="hub-icon">💻</span>
              <div className="hub-content">
                <h3>Practical, Job-Ready Curriculum</h3>
                <p>Hands-on projects and real-world exercises, not just theory.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/about" className="hub-card">
              <span className="hub-icon">🤝</span>
              <div className="hub-content">
                <h3>Mentorship & Internships</h3>
                <p>Guided learning with experienced professionals and real project exposure.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/certifications" className="hub-card">
              <span className="hub-icon">✅</span>
              <div className="hub-content">
                <h3>Placement Assistance</h3>
                <p>Career guidance, resume reviews, and interview preparation support.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/courses" className="hub-card">
              <span className="hub-icon">📚</span>
              <div className="hub-content">
                <h3>Wide Course Catalog</h3>
                <p>From programming and data science to management and emerging tech.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>

            <Link to="/contact" className="hub-card">
              <span className="hub-icon">💬</span>
              <div className="hub-content">
                <h3>Dedicated Support</h3>
                <p>Get help with course selection, onboarding, and certification queries.</p>
              </div>
              <span className="hub-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Meet Our Leadership</h2>
          <p className="section-subtitle">
            Behind Connect2Edtech is a leadership team committed to driving strategic growth, educational excellence, and real-world impact.
          </p>
          <div className="circle-cards">
            <div className="circle-card">
              <img className="leader-image" src="/assets/IMG-20260628-WA0001.jpg" alt="CEO Image" />
              <h3>Vikas Gowda J.A.</h3>
              <h4>CEO, Connect2Future</h4>
            </div>
            <div className="circle-card">
              <img className="leader-image" src="/assets/IMG-20260616-WA0051.jpg" alt="Karthik Gowda J.A." />
              <h3>Karthik Gowda J.A.</h3>
              <h4>Managing Director (MD), Connect2Future</h4>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="section">

        <div className="container">
          <h2 className="section-title">Featured Courses</h2>
          <p className="section-subtitle">A quick look at programs you can explore, add to cart, and enroll in.</p>

          <div className="card-grid">
            {featuredCourses.map((c) => (
              <div key={c.key} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="card-number">{c.price === 0 ? 'Free' : `₹${c.price}`}</div>
                <h3 style={{ marginBottom: 8, color: '#000000' }}>{c.title}</h3>
                <p style={{ marginBottom: 10 }}>{c.subtitle}</p>
                <p style={{ color: '#333333', fontSize: '0.9rem', marginBottom: 20, lineHeight: 1.6 }}>
                  {c.meta}
                </p>
                <ul style={{ listStyle: 'none', marginBottom: 20 }}>
                  {c.features.slice(0, 2).map((f, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: '0.9rem',
                        color: '#333333',
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <span style={{ color: '#ff00ff' }}>✦</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="card-actions" style={{ marginTop: 'auto' }}>
                  <Link to={`/course/${c.key}`} className="btn primary" style={{ flexGrow: 1 }}>View Details</Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <Link to="/courses" className="btn primary">Open Full Courses Catalog</Link>
            <Link to="/cart" className="btn secondary">My Cart ({cartCount})</Link>
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS & VERIFICATION */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Certifications & Verification</h2>
          <p className="section-subtitle">Earn verifiable credentials and verify student certificates through our dashboard.</p>

          <div className="card-grid">
            <div className="card">
              <div className="card-number">Course Completion</div>
              <h3>Course Completion Certificate</h3>
              <p>Issued after successful completion of training modules, assignments, and practical exercises.</p>
              <div className="card-actions">
                <Link to="/certifications" className="btn primary">Explore Types</Link>
                <Link to="/verify-certificate" className="btn secondary">Verify</Link>
              </div>
            </div>

            <div className="card">
              <div className="card-number">Internship</div>
              <h3>Internship Certification</h3>
              <p>Validates hands-on internship work and mentorship participation.</p>
              <div className="card-actions">
                <Link to="/certifications" className="btn primary">Explore Types</Link>
                <Link to="/receive-certificate" className="btn secondary">Receive</Link>
              </div>
            </div>

            <div className="card">
              <div className="card-number">Industry</div>
              <h3>Industry Certification</h3>
              <p>Advanced credential for specialized domain expertise and placement readiness.</p>
              <div className="card-actions">
                <Link to="/certifications" className="btn primary">Explore Types</Link>
                <Link to="/verify-certificate" className="btn secondary">Verify</Link>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <Link to="/verify-certificate" className="btn primary">Verify Certificate</Link>
            <Link to="/receive-certificate" className="btn secondary">Request / Receive Certificate</Link>
          </div>
        </div>
      </section>

      {/* ENROLLMENT FLOW */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Start your learning journey in four simple steps.</p>

          <div className="process" style={{ marginTop: 40 }}>
            <div className="step">
              <div className="step-number">1</div>
              <h3>Browse Courses</h3>
              <p>Explore our catalog and find the right program for your career goals.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Add to Cart</h3>
              <p>Select courses and add them to your cart for enrollment.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Enroll & Confirm</h3>
              <p>Complete the enrollment form and confirm via WhatsApp with our team.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Learn & Get Certified</h3>
              <p>Complete training, earn your certificate, and launch your career.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <Link to="/cart" className="btn primary">Go to Cart ({cartCount})</Link>
            <Link to="/enrollment" className="btn secondary">Start Enrollment</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Success Stories</h2>
          <p className="section-subtitle">What our students say about their learning experience with us.</p>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p>"The internship certificate is verifiable on their site, which was highly appreciated by recruiters."</p>
              <h4>- Onboarded Developer</h4>
            </div>
            <div className="testimonial-card">
              <p>"I was able to attach my project credentials to LinkedIn and received direct messages from recruiters."</p>
              <h4>- QA Analyst</h4>
            </div>
            <div className="testimonial-card">
              <p>"The practical training and mentorship helped me transition from academia to a real tech role seamlessly."</p>
              <h4>- Data Analyst</h4>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">About Connect2Edtech</h2>
          <p className="section-description">
            Connect2Edtech is a comprehensive learning platform bridging the gap between academic education and industry requirements.
            We provide practical training, certifications, mentorship, internships, and career guidance to help students become job-ready professionals.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Link to="/about" className="btn primary">Learn More About Us</Link>
          </div>
        </div>
      </section>

      {/* CONTACT PREVIEW */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">Have questions about courses, certifications, internships, or placements? We're here to help.</p>

          <div className="two-col" style={{ marginTop: 40 }}>
            <div className="card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: 12, color: '#000000' }}>Contact Information</h3>
              <p style={{ color: '#333333', marginBottom: 20 }}>
                Reach out to us directly or visit our office in Mysuru. Our team is ready to assist you with course selection, enrollment, and certification queries.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ color: '#000000' }}>
                  📍 Location: Mysuru, Karnataka, India
                </p>
                <p style={{ color: '#000000' }}>
                  📧 Email: <a href="mailto:connect2future.main@gmail.com" style={{ color: '#000000' }}>connect2future.main@gmail.com</a>
                </p>
                <p style={{ color: '#000000' }}>
                  📞 Phone: <a href="tel:+917019436720" style={{ color: '#000000' }}>+91 7019436720</a>
                </p>
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn primary">Open Contact Form</Link>
                <Link to="/courses" className="btn secondary">Browse Courses</Link>
              </div>
            </div>

            <div className="card" style={{ height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: 12, color: '#000000' }}>What We Can Help With</h3>
              <ul style={{ listStyle: 'none', marginBottom: 0 }}>
                {[
                  'Course Selection Guidance',
                  'Internship Project Verification',
                  'Verifiable Certification Processes',
                  'University / Institutional Collaborations',
                  'Placement Guidance & CV Review'
                ].map((x, i) => (
                  <li key={i} style={{ fontSize: '0.95rem', color: '#333333', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#000000' }}>✓</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Start Building Your Tech Career Today</h2>
          <p>Explore our curriculum and enroll in our programs to secure future-ready skills.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn primary">Explore Courses</Link>
            <Link to="/enrollment" className="btn secondary">Enroll Now</Link>
            <Link to="/contact" className="btn secondary">Talk to Us</Link>
          </div>
        </div>
      </section>
    </>
  )
}