import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function CertificationsPage() {
  const [selectedCert, setSelectedCert] = useState('course')

  useEffect(() => {
    document.title = 'Certifications - Industry Credentials | Connect2Edtech'
  }, [])

  const certData = {
    course: {
      title: 'Course Completion Certificate',
      meta: 'Issued by: Connect2Edtech | Type: Training Completion',
      description: 'Awarded upon successful completion of a core training program, demonstrating mastery of the curriculum, homework modules, and practical laboratory exercises.',
      benefits: [
        'Industry-recognized training credential',
        'Verifiable digital badge for LinkedIn & CV resumes',
        'High-resolution PDF and printed delivery options',
        'Lifetime registration validity on our system',
        'Course competency recognition'
      ],
      requirements: [
        'Complete all designated course modules (min 80% attendance)',
        'Pass the final assessment or domain test',
        'Submit required project work'
      ]
    },
    internship: {
      title: 'Internship Certification',
      meta: 'Issued by: Connect2Edtech | Type: Practical Work',
      description: 'Validates successful execution of a technical or non-technical internship, recognizing hands-on project experience, mentorship attendance, and professional workplace contributions.',
      benefits: [
        'Practical work experience validation',
        'Recognition of structural project deliverables',
        'Industry-aligned corporate exposure credential',
        'Detailed skills competency assessment report',
        'Recommendation letter eligibility for top performers'
      ],
      requirements: [
        'Complete the specified internship timeline (4 to 12 weeks)',
        'Submit all codebases, documents, and final project assets',
        'Receive positive supervisor feedback and evaluation review'
      ]
    },
    industry: {
      title: 'Industry Certification',
      meta: 'Issued by: Connect2Edtech | Type: Advanced Credential',
      description: 'Advanced credential validating specialized domain expertise, significantly bolstering employability and technical authority in the active job market.',
      benefits: [
        'Rigorous industry-standard credential',
        'High-impact employer recognized certification',
        'Professional career growth validation',
        'Strategic placement readiness proof',
        'Global digital verification footprint'
      ],
      requirements: [
        'Meet prerequisite domain experience criteria',
        'Clear the certification examination or benchmark test',
        'Participate in continuous professional review assessment'
      ]
    }
  }

  const activeCert = certData[selectedCert]

  const faqs = [
    { q: 'Who is eligible to request certificates?', a: 'Students, graduates, and working professionals who complete our courses or internship timelines are eligible.' },
    { q: 'How are certificates verified by employers?', a: 'Employers can visit our /verify-certificate page to request verification by providing the student ID and details.' },
    { q: 'Are printed certificates available?', a: 'Yes. While digital verifications are instant and free, students can request high-quality printed certificates to be couriered.' },
    { q: 'Are these courses online or offline?', a: 'We offer flexible learning pathways, with options for online self-paced courses, live remote webinars, or offline campus bootcamps.' }
  ]

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      {/* Hero */}
      <section className="cert-hero" style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: '3rem', marginBottom: 12 }}>Industry-Recognized Certifications</h1>
        <p className="section-subtitle" style={{ margin: '0 auto 24px auto' }}>
          Earn verifiable credentials that validate your skill sets, elevate your CV, and secure better career placement opportunities.
        </p>
        <div className="hero-buttons">
          <Link to="/verify-certificate" className="btn primary">
            Verify Certificate
          </Link>
          <Link to="/receive-certificate" className="btn secondary">
            Request Certification
          </Link>
        </div>
      </section>

      {/* Main Interactive Details */}
      <section className="section bg-light" style={{ borderRadius: 16, padding: '40px 24px', marginBottom: 60 }}>
        <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 12 }}>Explore Credentials</h2>
        <p className="section-subtitle" style={{ marginBottom: 32 }}>
          Click on any credential category below to view detailed requirements, benefits, and delivery methods.
        </p>

        <div className="category-filters" style={{ marginBottom: 40 }}>
          <button 
            type="button" 
            className={`filter-btn ${selectedCert === 'course' ? 'active' : ''}`}
            onClick={() => setSelectedCert('course')}
          >
            Course Completion
          </button>
          <button 
            type="button" 
            className={`filter-btn ${selectedCert === 'internship' ? 'active' : ''}`}
            onClick={() => setSelectedCert('internship')}
          >
            Internship Certificate
          </button>
          <button 
            type="button" 
            className={`filter-btn ${selectedCert === 'industry' ? 'active' : ''}`}
            onClick={() => setSelectedCert('industry')}
          >
            Industry Certification
          </button>
        </div>

        <div className="card" style={{ maxWidth: 850, margin: '0 auto', background: 'rgba(255, 255, 255, 0.01)' }}>
          <div className="two-col" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', color: '#a5b4fc', marginBottom: 6 }}>{activeCert.title}</h3>
              <p className="hint" style={{ marginBottom: 20 }}>{activeCert.meta}</p>
              <p style={{ color: 'var(--text-primary)', marginBottom: 24, fontSize: '0.98rem', lineHeight: 1.7 }}>
                {activeCert.description}
              </p>

              <h4 style={{ fontSize: '1.1rem', marginBottom: 12, color: 'var(--text-white)' }}>Key Benefits:</h4>
              <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                {activeCert.benefits.map((b, i) => (
                  <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--success)' }}>✓</span> {b}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: 12, color: 'var(--text-white)' }}>Completion Requirements:</h4>
              <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                {activeCert.requirements.map((r, i) => (
                  <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: '#a855f7', marginTop: 2 }}>✦</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/enrollment" className="btn primary" style={{ width: '100%' }}>
                  Enroll Now
                </Link>
                <Link to="/contact" className="btn secondary" style={{ width: '100%', textAlign: 'center' }}>
                  Inquire Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why they matter */}
      <section className="section" style={{ padding: '40px 0' }}>
        <h2 className="section-title" style={{ fontSize: '2rem' }}>Why Verifiable Credentials Matter</h2>
        <p className="section-subtitle">
          In a competitive digital workforce, professional validation is critical.
        </p>

        <div className="benefit-grid">
          <div className="benefit-card">
            <h3>Skill Validation</h3>
            <p>Prove your technical and workplace readiness with certs backed by project portfolios.</p>
          </div>
          <div className="benefit-card">
            <h3>Recruiter Friendly</h3>
            <p>Share credentials directly to LinkedIn so headhunters can verify your profile instantly.</p>
          </div>
          <div className="benefit-card">
            <h3>Career Progression</h3>
            <p>Support your promotions, salary reviews, and career transitions with concrete metrics.</p>
          </div>
          <div className="benefit-card">
            <h3>Strong Portfolio</h3>
            <p>Merge course completion with internship work to compile a high-impact code repository.</p>
          </div>
        </div>
      </section>

      {/* Verification timeline process */}
      <section className="section bg-light" style={{ borderRadius: 16, padding: '40px 24px', margin: '40px 0' }}>
        <h2 className="section-title" style={{ fontSize: '2rem' }}>Certification Pipeline</h2>
        <p className="section-subtitle">
          Follow a simple structured pathway from enrollment to verifiable registration.
        </p>

        <div className="process">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Enroll</h3>
            <p>Select training domain.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Learn</h3>
            <p>Complete training modules.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Practice</h3>
            <p>Develop capstone projects.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Get Certified</h3>
            <p>Verifiable issuance.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ padding: '40px 0' }}>
        <h2 className="section-title" style={{ fontSize: '2rem' }}>Student Reviews</h2>
        <p className="section-subtitle">Hear how credentials help learners establish structural career progress.</p>
        
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"The internship certificate is verifiable on their site, which was highly appreciated by recruiters."</p>
            <h4>- Onboarded Developer</h4>
          </div>
          <div className="testimonial-card">
            <p>"I was able to attach my project credentials to LinkedIn and received direct messages from recruiters."</p>
            <h4>- QA Analyst</h4>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section bg-light" style={{ borderRadius: 16, padding: '40px 24px', margin: '40px 0' }}>
        <h2 className="section-title" style={{ fontSize: '2rem' }}>Frequently Asked Questions</h2>
        <p className="section-subtitle">Common questions regarding certificate validation, timelines, and courier requests.</p>
        
        <div className="faq-grid">
          {faqs.map((f, i) => (
            <div className="faq-card" key={i}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Upgrade Your Professional Standing</h2>
        <p>Explore our courses, complete required projects, and secure verifiable industry-recognized certifications.</p>
        <div className="hero-buttons">
          <Link to="/courses" className="btn primary">Explore Courses</Link>
          <Link to="/contact" className="btn secondary">Get in Touch</Link>
        </div>
      </section>
    </div>
  )
}
