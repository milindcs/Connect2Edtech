import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaClock, FaUsers, FaStar, FaWhatsapp } from 'react-icons/fa';
import { coursesApi } from '../utils/api';
import './CourseDetails.css';

const fallbackCoursesDetails = {
  'cyber-security': {
    key: 'cyber-security',
    title: 'Cyber Security',
    subtitle: 'Learn ethical hacking, network security, and how to protect systems from threats.',
    category: 'technical',
    duration: '12 weeks',
    level: 'Beginner to Advanced',
    mode: 'Online / Offline',
    price: 2000,
    features: [
      'Ethical hacking techniques',
      'Network security fundamentals',
      'Threat detection and prevention',
      'Security tools and practices',
      'Incident response',
      'Certification guidance',
    ],
  },
  'skill-development': {
    key: 'skill-development',
    title: 'Skill Development Programs',
    subtitle: 'Comprehensive skill-building programs to enhance your employability and career prospects.',
    category: 'nontechnical',
    duration: '8 weeks',
    level: 'All levels',
    mode: 'Online / Offline',
    price: 4500,
    features: [
      'Communication skills',
      'Problem-solving abilities',
      'Team collaboration',
      'Time management',
      'Leadership skills',
      'Interview preparation',
    ],
  },
  'aptitude-training': {
    key: 'aptitude-training',
    title: 'Aptitude Training Program',
    subtitle: 'Master quantitative aptitude, logical reasoning, and verbal ability for placements.',
    category: 'nontechnical',
    duration: '6 weeks',
    level: 'All levels',
    mode: 'Online',
    price: 4500,
    features: [
      'Quantitative aptitude',
      'Logical reasoning',
      'Verbal ability',
      'Data interpretation',
      'Practice tests',
      'Placement-focused training',
    ],
  },
  'soft-skills': {
    key: 'soft-skills',
    title: 'Soft Skills Training Program',
    subtitle: 'Develop communication, leadership, and interpersonal skills for professional success.',
    category: 'nontechnical',
    duration: '6 weeks',
    level: 'All levels',
    mode: 'Online / Offline',
    price: 4500,
    features: [
      'Effective communication',
      'Presentation skills',
      'Leadership development',
      'Emotional intelligence',
      'Conflict resolution',
      'Professional etiquette',
    ],
  },
  'ai-training': {
    key: 'ai-training',
    title: 'Artificial Intelligence Training Program',
    subtitle: 'Learn AI fundamentals, machine learning basics, and real-world AI applications.',
    category: 'technical',
    duration: '12 weeks',
    level: 'Beginner to Intermediate',
    mode: 'Online',
    price: 4500,
    features: [
      'AI fundamentals',
      'Machine learning basics',
      'Neural networks intro',
      'Real-world AI applications',
      'Hands-on projects',
      'Industry use cases',
    ],
  },
  'mern-stack': {
    key: 'mern-stack',
    title: 'MERN Stack Training Program',
    subtitle: 'Master MongoDB, Express, React, and Node.js to build full-stack web applications.',
    category: 'technical',
    duration: '12 weeks',
    level: 'Beginner to Advanced',
    mode: 'Online / Offline',
    price: 4500,
    features: [
      'Build real-world projects',
      'Deploy applications to cloud',
      'REST API development',
      'Authentication & security',
      'Interview preparation',
      'Job placement support',
    ],
  },
  'java-training': {
    key: 'java-training',
    title: 'Java Training Program',
    subtitle: 'Learn core and advanced Java programming for enterprise applications and backend development.',
    category: 'technical',
    duration: '10 weeks',
    level: 'Beginner to Advanced',
    mode: 'Online / Offline',
    price: 4500,
    features: [
      'Core Java concepts',
      'Advanced Java programming',
      'Spring framework',
      'Database connectivity',
      'Enterprise applications',
      'Industry projects',
    ],
  },
  'big-data': {
    key: 'big-data',
    title: 'Big Data Training Program',
    subtitle: 'Master Hadoop, Spark, and big data analytics for handling large-scale data processing.',
    category: 'technical',
    duration: '12 weeks',
    level: 'Intermediate',
    mode: 'Online',
    price: 4500,
    features: [
      'Hadoop ecosystem',
      'Spark processing',
      'Big data analytics',
      'Data pipelines',
      'Real-time processing',
      'Industry projects',
    ],
  },
  'cyber-security-training': {
    key: 'cyber-security-training',
    title: 'Cyber Security Training Program',
    subtitle: 'Comprehensive training in network security, ethical hacking, and threat management.',
    category: 'technical',
    duration: '14 weeks',
    level: 'Beginner to Advanced',
    mode: 'Online / Offline',
    price: 4500,
    features: [
      'Network security',
      'Ethical hacking',
      'Penetration testing',
      'Security tools',
      'Incident response',
      'Certification guidance',
    ],
  },
  'python-fullstack': {
    key: 'python-fullstack',
    title: 'Python Full Stack Training Program',
    subtitle: 'Become a full-stack developer using Python, Django, React, and databases.',
    category: 'technical',
    duration: '14 weeks',
    level: 'Beginner to Advanced',
    mode: 'Online / Offline',
    price: 2000,
    features: [
      'Python programming',
      'Django framework',
      'React frontend',
      'Database design',
      'API development',
      'Deployment skills',
    ],
  },
  'cpp-training': {
    key: 'cpp-training',
    title: 'C++ Training Program',
    subtitle: 'Learn C++ programming for system development, competitive programming, and OOP concepts.',
    category: 'technical',
    duration: '8 weeks',
    level: 'Beginner to Intermediate',
    mode: 'Online',
    price: 2000,
    features: [
      'C++ fundamentals',
      'Object-oriented programming',
      'Data structures',
      'Algorithm design',
      'Competitive programming',
      'System development',
    ],
  },
};

const curriculum = [
  { module: 'Module 1', title: 'Introduction & Fundamentals', duration: '2 weeks' },
  { module: 'Module 2', title: 'Core Concepts & Tools', duration: '3 weeks' },
  { module: 'Module 3', title: 'Practical Projects', duration: '3 weeks' },
  { module: 'Module 4', title: 'Advanced Topics', duration: '2 weeks' },
  { module: 'Module 5', title: 'Capstone Project', duration: '2 weeks' },
];

const faqs = [
  {
    question: 'Who is this course for?',
    answer: 'This course is designed for beginners as well as professionals looking to upskill. No prior experience is required.',
  },
  {
    question: 'What is the course duration?',
    answer: 'The course spans 12 weeks with flexible learning options including self-paced modules.',
  },
  {
    question: 'Will I get certification?',
    answer: 'Yes, you will receive an industry-recognized certificate upon successful completion of the course.',
  },
  {
    question: 'What kind of placement support is provided?',
    answer: 'We provide comprehensive placement assistance including resume building, mock interviews, and job referrals.',
  },
];

export default function CourseDetails() {
  const { courseKey } = useParams();
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseKey]);

  const loadCourse = async () => {
    try {
      const response = await coursesApi.getAll();
      if (response.data?.ok && response.data.data?.all) {
        const found = response.data.data.all.find((c) => c.key === courseKey);
        if (found) {
          setCourse(found);
          const related = response.data.data.all
            .filter((c) => c.key !== courseKey && c.category === found.category)
            .slice(0, 3);
          setRelatedCourses(related);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    }
    const fallback = fallbackCoursesDetails[courseKey];
    if (fallback) {
      setCourse(fallback);
      const related = Object.values(fallbackCoursesDetails).filter(
        (c) => c.key !== courseKey && c.category === fallback.category
      );
      setRelatedCourses(related.slice(0, 3));
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }

  if (!course) {
    return (
      <div className="not-found">
        <div>
          <h1>Course Not Found</h1>
          <p>The course you are looking for does not exist.</p>
          <Link to="/courses" className="btn btn-primary">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Connect2EdTech Team,I am interested in the ${course.title} course. Please provide more details about enrollment and schedule.Thank you.`
  );

  return (
    <div className="course-details">
      {/* Hero Banner */}
      <section className="course-hero">
        <div className="hero-overlay"></div>
        <div className="container">
          <motion.div
            className="course-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="course-category">{course.category}</span>
            <h1 className="course-hero-title">{course.title}</h1>
            <p className="course-hero-subtitle">{course.subtitle}</p>
            <div className="course-hero-meta">
              <span>⏱️ {course.duration}</span>
              <span>📊 {course.level}</span>
              <span>💻 {course.mode}</span>
            </div>
            <div className="course-hero-actions">
              <Link to={`/enroll?course=${course.key}`} className="btn btn-primary btn-lg">
                Enroll Now
              </Link>
              <a
                href={`https://wa.me/917019436720?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <FaWhatsapp /> Contact on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Course Content */}
      <section className="section">
        <div className="container">
          <div className="course-layout">
            {/* Main Content */}
            <div className="course-main">
              {/* Description */}
              <motion.div
                className="course-section"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2>Course Description</h2>
                <p>{course.subtitle}</p>
              </motion.div>

              {/* Learning Outcomes */}
              <motion.div
                className="course-section"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2>Learning Outcomes</h2>
                <div className="outcomes-list">
                  {(course.features || []).map((feature, index) => (
                    <div key={index} className="outcome-item">
                      <FaCheckCircle className="outcome-icon" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Curriculum */}
              <motion.div
                className="course-section"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2>Course Curriculum</h2>
                <div className="curriculum-list">
                  {curriculum.map((item, index) => (
                    <div key={index} className="curriculum-item">
                      <div className="curriculum-header">
                        <span className="module-number">{item.module}</span>
                        <span className="module-title">{item.title}</span>
                        <span className="module-duration">⏱️ {item.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* FAQs */}
              <motion.div
                className="course-section"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2>Frequently Asked Questions</h2>
                <div className="faq-list">
                  {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <h4>{faq.question}</h4>
                      <p>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="course-sidebar">
              <div className="sidebar-card">
                <div className="sidebar-price">
                  <span className="price-label">Course Fee</span>
                  <span className="price-value">₹{course.price}</span>
                </div>
                <Link to={`/enroll?course=${course.key}`} className="btn btn-primary btn-block">
                  Enroll Now
                </Link>
                <a
                  href={`https://wa.me/917019436720?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-block"
                >
                  <FaWhatsapp /> WhatsApp Inquiry
                </a>

                <div className="sidebar-info">
                  <div className="info-item">
                    <FaClock /> <span>Duration: {course.duration}</span>
                  </div>
                  <div className="info-item">
                    <FaUsers /> <span>Level: {course.level}</span>
                  </div>
                  <div className="info-item">
                    <FaStar /> <span>Mode: {course.mode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <section className="section related-section">
          <div className="container">
            <h2 className="section-title">Related Courses</h2>
            <div className="related-grid">
              {relatedCourses.map((related, index) => (
                <motion.div
                  key={related.key}
                  className="related-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/courses/${related.key}`} className="related-link">
                    <div className="related-badge">{related.category}</div>
                    <h3>{related.title}</h3>
                    <p>{related.subtitle}</p>
                    <span className="related-price">₹{related.price}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}