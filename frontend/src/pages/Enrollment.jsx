import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { enrollmentApi, coursesApi } from '../utils/api';
import { buildWhatsAppUrl } from '../components/WhatsAppFloat';
import './Enrollment.css';

const fallbackCourses = [
  {
    key: 'cyber-security',
    title: 'Cyber Security',
    subtitle: 'Learn ethical hacking, network security, and how to protect systems from threats.',
    category: 'technical',
    duration: '12 weeks',
    level: 'Beginner to Advanced',
    mode: 'Online / Offline',
    price: 2000,
  },
  {
    key: 'skill-development',
    title: 'Skill Development Programs',
    subtitle: 'Comprehensive skill-building programs to enhance your employability and career prospects.',
    category: 'nontechnical',
    duration: '8 weeks',
    level: 'All levels',
    mode: 'Online / Offline',
    price: 4500,
  },
  {
    key: 'aptitude-training',
    title: 'Aptitude Training Program',
    subtitle: 'Master quantitative aptitude, logical reasoning, and verbal ability for placements.',
    category: 'nontechnical',
    duration: '6 weeks',
    level: 'All levels',
    mode: 'Online',
    price: 4500,
  },
  {
    key: 'soft-skills',
    title: 'Soft Skills Training Program',
    subtitle: 'Develop communication, leadership, and interpersonal skills for professional success.',
    category: 'nontechnical',
    duration: '6 weeks',
    level: 'All levels',
    mode: 'Online / Offline',
    price: 4500,
  },
  {
    key: 'ai-training',
    title: 'Artificial Intelligence Training Program',
    subtitle: 'Learn AI fundamentals, machine learning basics, and real-world AI applications.',
    category: 'technical',
    duration: '12 weeks',
    level: 'Beginner to Intermediate',
    mode: 'Online',
    price: 4500,
  },
  {
    key: 'mern-stack',
    title: 'MERN Stack Training Program',
    subtitle: 'Master MongoDB, Express, React, and Node.js to build full-stack web applications.',
    category: 'technical',
    duration: '12 weeks',
    level: 'Beginner to Advanced',
    mode: 'Online / Offline',
    price: 4500,
  },
  {
    key: 'java-training',
    title: 'Java Training Program',
    subtitle: 'Learn core and advanced Java programming for enterprise applications and backend development.',
    category: 'technical',
    duration: '10 weeks',
    level: 'Beginner to Advanced',
    mode: 'Online / Offline',
    price: 4500,
  },
  {
    key: 'big-data',
    title: 'Big Data Training Program',
    subtitle: 'Master Hadoop, Spark, and big data analytics for handling large-scale data processing.',
    category: 'technical',
    duration: '12 weeks',
    level: 'Intermediate',
    mode: 'Online',
    price: 4500,
  },
  {
    key: 'cyber-security-training',
    title: 'Cyber Security Training Program',
    subtitle: 'Comprehensive training in network security, ethical hacking, and threat management.',
    category: 'technical',
    duration: '14 weeks',
    level: 'Beginner to Advanced',
    mode: 'Online / Offline',
    price: 4500,
  },
  {
    key: 'python-fullstack',
    title: 'Python Full Stack Training Program',
    subtitle: 'Become a full-stack developer using Python, Django, React, and databases.',
    category: 'technical',
    duration: '14 weeks',
    level: 'Beginner to Advanced',
    mode: 'Online / Offline',
    price: 2000,
  },
  {
    key: 'cpp-training',
    title: 'C++ Training Program',
    subtitle: 'Learn C++ programming for system development, competitive programming, and OOP concepts.',
    category: 'technical',
    duration: '8 weeks',
    level: 'Beginner to Intermediate',
    mode: 'Online',
    price: 2000,
  },
];

export default function Enrollment() {
  const [searchParams] = useSearchParams();
  const preselectedCourse = searchParams.get('course') || '';
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    qualification: '',
    city: '',
    state: '',
    courseSelected: preselectedCourse,
    message: '',
  });
  const [status, setStatus] = useState({ submitting: false, submitted: false, error: '' });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await coursesApi.getAll();
      if (response.data?.ok && response.data.data?.all) {
        setCourses(response.data.data.all);
        return;
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
    setCourses(fallbackCourses);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, submitted: false, error: '' });

    let apiOk = false;

    try {
      const response = await enrollmentApi.create(formData);
      apiOk = response.data?.ok;
      if (!apiOk) {
        setStatus({
          submitting: false,
          submitted: false,
          error: response.data?.error || 'Failed to submit enrollment. Please try again.',
        });
      }
    } catch (error) {
      setStatus({
        submitting: false,
        submitted: false,
        error: 'Something went wrong. Please try again later.',
      });
    }

    try {
      const messageLines = [
        `Name: ${formData.fullName}`,
        `Email: ${formData.email}`,
        `Phone: ${formData.phone}`,
        formData.college ? `College: ${formData.college}` : '',
        formData.qualification ? `Qualification: ${formData.qualification}` : '',
        formData.courseSelected ? `Course: ${formData.courseSelected}` : '',
        formData.city ? `City: ${formData.city}` : '',
        formData.state ? `State: ${formData.state}` : '',
        formData.message ? `Message: ${formData.message}` : '',
      ].filter(Boolean).join('\n');

      const waUrl = buildWhatsAppUrl({
        phone: '7019436720',
        text: `New Enrollment:\n\n${messageLines}`,
      });
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to open WhatsApp:', err);
    }

    if (apiOk) {
      setStatus({ submitting: false, submitted: true, error: '' });
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        college: '',
        qualification: '',
        city: '',
        state: '',
        courseSelected: '',
        message: '',
      });

      setTimeout(() => setStatus((prev) => ({ ...prev, submitted: false })), 5000);
    }
  };

  return (
    <div className="enrollment-page">
      <section className="enrollment-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="enrollment-title">Enroll Now</h1>
            <p className="enrollment-subtitle">
              Take the first step towards your dream career. Fill out the form below and our team will contact you.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="enrollment-page-content">
        <section className="section">
          <div className="container">
            <div className="enrollment-grid">
              <motion.div
                className="enrollment-form-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2>Enrollment Form</h2>

                {status.submitted && (
                  <div className="alert-success">
                    <FaCheckCircle /> Enrollment submitted successfully! We will contact you within 24 hours.
                  </div>
                )}

                {status.error && <div className="alert-error">{status.error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">College</label>
                      <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your college name"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your qualification"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Course *</label>
                      <select
                        name="courseSelected"
                        value={formData.courseSelected}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                          <option key={course.key} value={course.key}>
                            {course.title} - ₹{course.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your city"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your state"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message (Optional)</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Any specific requirements or questions?"
                      rows="4"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status.submitting}
                    className="btn btn-primary btn-block btn-lg"
                  >
                    {status.submitting ? 'Submitting...' : 'Submit Enrollment'}
                  </button>
                </form>
              </motion.div>

              <div className="enrollment-info">
                <div className="info-card">
                  <h3>Why Enroll With Us?</h3>
                  <ul className="benefits-list">
                    <li>Industry-recognized certification</li>
                    <li>Expert instructors with real-world experience</li>
                    <li>Hands-on projects and practical training</li>
                    <li>Comprehensive placement assistance</li>
                    <li>Flexible learning schedule</li>
                    <li>Lifetime access to course materials</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}