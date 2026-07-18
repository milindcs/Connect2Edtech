import { Link } from 'react-router-dom';
import { FaInstagram, FaLinkedin, FaWhatsapp, FaArrowUp } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              Connect2EdTech
            </Link>
            <p className="footer-description">
              Empowering careers through world-class technical and non-technical training programs.
            </p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/courses">Courses</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/enroll">Enroll</Link>
          </div>


          <div className="footer-social">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a
                href="https://www.instagram.com/the_c2f_?igsh=ZzU5OTRkYjl4ZHJj"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.linkedin.com/company/connect2edtech/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://wa.me/917019436720"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaWhatsapp />
              </a>
            </div>
            <div className="footer-contact">
              <p>Email: hr@connect2future.com</p>
              <p>Phone: +91 7019436720</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
<p>© 2026 Connect2EdTech. All rights reserved.</p>
          <button className="back-to-top" onClick={scrollToTop}>
            <FaArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
}