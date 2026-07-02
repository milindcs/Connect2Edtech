import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3>Connect2Edtech</h3>
          <p>Empowering Students with Industry-Ready Skills. Learn Today. Lead Tomorrow.</p>
          <ul className="contact-info">
            <li>📞 +91 7019436720</li>
            <li>
              <a href="mailto:connect2future.main@gmail.com">✉️ connect2future.main@gmail.com</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/courses">Courses</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for the latest course updates.</p>
          <form
            className="newsletter-form"
            action="https://formsubmit.co/connect2future.main@gmail.com"
            method="POST"
          >
            <input type="email" name="email" placeholder="Your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Connect2Edtech. All rights reserved.</p>
      </div>
    </footer>
  )
}

