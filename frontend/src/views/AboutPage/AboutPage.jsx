import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Us - Connect2Edtech'
  }, [])

  return (
    <>
      <section id="about" className="section">
        <div className="container">
          <h2 className="section-title">About Connect2Edtech</h2>

          <div className="about-images-row">
            <img src="/assets/Screenshot 2026-06-16 130637.png" alt="About image 1" />
            <img src="/assets/Screenshot 2026-06-16 131016.png" alt="About image 2" />
            <img src="/assets/IMG-20260616-WA0037.jpg" alt="About image 3" />
            <img src="/assets/IMG-20260616-WA0038.jpg" alt="About image 4" />
          </div>

          <p className="section-description">
            Connect2Edtech is a comprehensive learning platform
            to bridging the gap between academic education and industry requirements.
            We provide practical training, certifications, mentorship, internships,
            and career guidance to help students become job-ready professionals.
          </p>

          <div className="leadership-section">
            <h2 className="section-title">Meet Our Leadership</h2>
            <p className="section-subtitle">
              Behind Connect2Future EdTech is a leadership team committed to driving strategic growth, educational excellence, and real-world impact.
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

          <div className="who-we-are">
            <h3>Who We Are</h3>
            <p>We are a visionary educational technology organization dedicated to bridging the gap between traditional learning and the rapidly evolving demands of the global workforce. By creating comprehensive, cutting-edge curricula, we transform complex digital landscapes into accessible, structured pathways for learners everywhere.</p>
          </div>

<div className="mission-vision-container">
             <div className="mv-inner">
               <div>
                 <h3>Our Mission</h3>
                 <img className="round-image" src="/assets/Gemini_Generated_Image_u91l8ru91l8ru91l.png" alt="Our Mission" />
                 <p>To build a globally connected ecosystem where every learner has seamless access to future-proof skills, empowering them to become proactive creators, innovators, and leaders of tomorrow's digital world.</p>
               </div>

               <div>
                 <h3>Our Vision</h3>
                 <img className="round-image" src="/assets/Gemini_Generated_Image_6bqcq36bqcq36bqc (1).png" alt="Our Vision" />
                 <p><strong>Empower Through Innovation:</strong> To design and deliver comprehensive, industry-aligned curricula focusing on Digital Literacy, Computational Thinking, and Coding Fundamentals.</p>
                 <p><strong>Bridge the Gap:</strong> To provide educational institutions and students with the critical tools required to transition smoothly into the future of technology.</p>
               </div>
             </div>
             <div style={{ marginTop: 24, textAlign: 'center' }}>
               <Link to="/" className="btn secondary">Back to Home</Link>
             </div>
           </div>
        </div>
      </section>

      <section className="why-choose section bg-light">
        <div className="container">
          <div className="section-heading">
            <h2>Your Partner in Career Growth</h2>
            <p>Industry-Relevant Courses, Expert Mentorship, Internship Opportunities, and Career Support.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Industry-Relevant Courses</h3>
              <p>Learn skills aligned with current industry demands and trends.</p>
            </div>

            <div className="feature-box">
              <h3>Expert Mentorship</h3>
              <p>Receive guidance from experienced professionals and trainers.</p>
            </div>

            <div className="feature-box">
              <h3>Internship Opportunities</h3>
              <p>Gain real-world exposure through internship programs.</p>
            </div>

            <div className="feature-box">
              <h3>Career Support</h3>
              <p>Resume building, interview preparation, and placement assistance.</p>
            </div>

            <div className="feature-box">
              <h3>Certification Programs</h3>
              <p>Earn recognized certifications that strengthen your profile.</p>
            </div>

            <div className="feature-box">
              <h3>Hands-On Learning</h3>
              <p>Work on practical projects and real-world case studies.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Start Your Learning Journey Today</h2>
          <p>
            Explore our courses and enroll now to build the skills that matter.
          </p>
          <Link to="/courses" className="btn primary">Explore Courses</Link>
          <Link to="/enrollment" className="btn secondary">Enroll Now</Link>
        </div>
      </section>
    </>
  )
}