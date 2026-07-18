import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaBook } from 'react-icons/fa';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container">
        <motion.div
          className="not-found-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="error-code">404</h1>
          <h2 className="error-title">Page Not Found</h2>
          <p className="error-message">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
          <div className="error-buttons">
            <Link to="/" className="btn btn-primary btn-lg">
              <FaHome /> Go Home
            </Link>
            <Link to="/courses" className="btn btn-secondary btn-lg">
              <FaBook /> Browse Courses
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}