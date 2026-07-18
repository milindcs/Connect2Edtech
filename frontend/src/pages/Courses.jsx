import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { coursesApi } from '../utils/api';
import './Courses.css';

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

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, activeTab, searchQuery]);

  const loadCourses = async () => {
    try {
      const response = await coursesApi.getAll();
      if (response.data?.ok && response.data.data?.all) {
        setCourses(response.data.data.all);
        setFilteredCourses(response.data.data.all);
        return;
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
    setCourses(fallbackCourses);
    setFilteredCourses(fallbackCourses);
    setLoading(false);
  };

  const filterCourses = () => {
    let filtered = courses;

    if (activeTab === 'technical') {
      filtered = courses.filter((course) => course.category === 'technical');
    } else if (activeTab === 'nontechnical') {
      filtered = courses.filter((course) => course.category === 'nontechnical');
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const tabs = [
    { id: 'all', label: 'All Courses' },
    { id: 'technical', label: 'Technical' },
    { id: 'nontechnical', label: 'Non Technical' },
  ];

  return (
    <div className="courses-page">
      {/* Hero */}
      <section className="courses-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="courses-hero-title">Explore Our Courses</h1>
            <p className="courses-hero-subtitle">
              Discover a wide range of technical and non-technical courses designed to boost your career
            </p>
          </motion.div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="section">
        <div className="container">
          {/* Search Bar */}
          <div className="courses-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Tabs */}
          <div className="courses-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="loading">Loading courses...</div>
          ) : filteredCourses.length > 0 ? (
            <div className="courses-grid">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.key}
                  className="course-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div className="course-badge">{course.category}</div>
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-subtitle">{course.subtitle}</p>
                    <div className="course-meta">
                      <span>⏱️ {course.duration}</span>
                      <span>📊 {course.level}</span>
                      <span>💻 {course.mode}</span>
                    </div>
                    <div className="course-footer">
                      <span className="course-price">₹{course.price}</span>
                      <div className="course-actions">
                        <a href={`/courses/${course.key}`} className="btn btn-outline">
                          View Details
                        </a>
                        <a href={`/enroll?course=${course.key}`} className="btn btn-primary">
                          Enroll
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="no-courses">
              <p>No courses found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}