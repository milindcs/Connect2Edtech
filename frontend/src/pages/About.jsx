import { motion } from 'framer-motion';
import { FaBullseye, FaEye, FaHeart, FaHandshake } from 'react-icons/fa';
import './About.css';

const values = [
  {
    icon: FaBullseye,
    title: 'Mission',
    description: 'To empower individuals with industry-relevant skills and transform their careers through quality education.',
  },
  {
    icon: FaEye,
    title: 'Vision',
    description: 'To become the most trusted EdTech platform, bridging the gap between education and employment.',
  },
  {
    icon: FaHeart,
    title: 'Values',
    description: 'We believe in integrity, excellence, student success, continuous innovation, and inclusive education.',
  },
  {
    icon: FaHandshake,
    title: 'Commitment',
    description: 'Dedicated to providing practical, job-ready training with personalized mentorship and placement support.',
  },
];

const milestones = [
  { year: '2020', title: 'Founded', description: 'Started with a vision to transform technical education' },
  { year: '2021', title: 'First 1000 Students', description: 'Reached milestone of 1000 trained professionals' },
  { year: '2022', title: 'Industry Partnerships', description: 'Partnered with 50+ companies for placements' },
  { year: '2023', title: 'Expanded Programs', description: 'Launched 15+ courses across technical and non-technical domains' },
  { year: '2024', title: '5000+ Alumni', description: 'Strong community of 5000+ successful professionals placed worldwide' },
  { year: '2025', title: 'Digital Expansion', description: 'Scaled online learning with AI-powered mentorship and live classes' },
  { year: '2026', title: '3 Branches & Growing', description: 'Expanded to Bangalore, Mysore & Hassan branches with 20,000+ learners and 100+ placement partners' },
];

export default function About() {
  return (
    <div className="about">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="about-hero-title">About Connect2EdTech</h1>
            <p className="about-hero-subtitle">
              Empowering careers through innovative education and industry-aligned training programs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="section">
        <div className="container">
          <motion.div
            className="about-intro"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Who We Are</h2>
            <p className="about-intro-text">
              Connect2EdTech is a premier EdTech platform dedicated to transforming careers through comprehensive,
              industry-focused training programs. We specialize in both technical and non-technical skills development,
              preparing students for successful careers in today's competitive job market.
            </p>
            <p className="about-intro-text">
              With a team of experienced industry professionals and educators, we deliver practical, hands-on learning
              experiences that bridge the gap between academic knowledge and real-world applications. Our programs are
              designed in collaboration with industry experts to ensure relevance and employability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="section values-section">
        <div className="container">
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="value-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="value-icon">
                  <value.icon />
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="section journey-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Journey</h2>
            <p className="section-subtitle">
              From humble beginnings to impacting thousands of careers
            </p>
          </div>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                className="timeline-item"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="section industries-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Industries We Serve</h2>
            <p className="section-subtitle">
              Training professionals for diverse industries and career paths
            </p>
          </div>
          <div className="industries-grid">
            {[
              'Information Technology',
              'Data Science & Analytics',
              'Cloud Computing',
              'Cybersecurity',
              'Digital Marketing',
              'Finance & Banking',
              'Healthcare IT',
              'E-commerce',
              'Telecommunications',
              'Consulting',
            ].map((industry, index) => (
              <motion.div
                key={industry}
                className="industry-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                {industry}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}