import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaBook, FaBriefcase, FaBuilding } from 'react-icons/fa';
import { coursesApi } from '../utils/api';
import './Home.css';

const stats = [
  { icon: FaUsers, label: 'Students Trained', value: '5000+' },
  { icon: FaBook, label: 'Courses', value: '15+' },
  { icon: FaBriefcase, label: 'Placements', value: '3000+' },
  { icon: FaBuilding, label: 'Industry Partners', value: '100+' },
];

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

const testimonials = [
  {
    name: 'Arun Kumar',
    role: 'MERN Stack Graduate',
    content: 'The training was excellent. Got placed within 2 months of completing the course.',
    image: '/assets/testimonial1.jpg',
  },
  {
    name: 'Sneha Patel',
    role: 'Data Science Student',
    content: 'Practical projects and industry-relevant curriculum helped me land my dream job.',
    image: '/assets/testimonial2.jpg',
  },
  {
    name: 'Rahul Sharma',
    role: 'Cloud Computing',
    content: 'The instructors are very supportive. Great learning experience overall.',
    image: '/assets/testimonial3.jpg',
  },
];

export default function Home() {
  const [courses, setCourses] = useState([]);

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

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              Transform Your Career with
              <span className="gradient-text"> Industry-Ready Skills</span>
            </h1>
            <p className="hero-subtitle">
              Master in-demand technical and non-technical skills with expert-led courses.
              Get certified, get placed, and accelerate your career growth.
            </p>
            <div className="hero-buttons">
              <Link to="/courses" className="btn btn-primary btn-lg">
                Explore Courses
              </Link>
              <Link to="/contact" className="btn btn-outline btn-lg">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="stat-icon">
                  <stat.icon />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section featured-courses">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Courses</h2>
            <p className="section-subtitle">
              Explore our most enrolled courses and start your learning journey today
            </p>
          </div>
          <div className="courses-grid">
            {courses.slice(0, 6).map((course, index) => (
              <motion.div
                key={course.key}
                className="course-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="course-badge">{course.category}</div>
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-subtitle">{course.subtitle}</p>
                  <div className="course-meta">
                    <span>{course.duration}</span>
                    <span>{course.level}</span>
                    <span>{course.mode}</span>
                  </div>
                  <div className="course-footer">
                    <span className="course-price">₹{course.price}</span>
                    <Link to={`/courses/${course.key}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/courses" className="btn btn-secondary">
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section why-choose-us">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">
              We are committed to providing the best learning experience
            </p>
          </div>
          <div className="why-choose-grid">
            <div className="why-choose-card">
              <h3>Expert Instructors</h3>
              <p>Learn from industry professionals with years of real-world experience.</p>
            </div>
            <div className="why-choose-card">
              <h3>Hands-on Projects</h3>
              <p>Gain practical experience with real-world projects and assignments.</p>
            </div>
            <div className="why-choose-card">
              <h3>Job Placement Support</h3>
              <p>Get dedicated placement assistance and career guidance from our team.</p>
            </div>
            <div className="why-choose-card">
              <h3>Flexible Learning</h3>
              <p>Choose between online and offline modes that fit your schedule.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Student Success Stories</h2>
            <p className="section-subtitle">
              Hear from our students who transformed their careers with us
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="testimonial-name">{testimonial.name}</div>
                    <div className="testimonial-role">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of students who have transformed their careers with Connect2EdTech</p>
            <Link to="/enroll" className="btn btn-white btn-lg">
              Enroll Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}