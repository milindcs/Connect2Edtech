import { motion } from 'framer-motion';
import {
  FaChalkboardTeacher,
  FaBriefcase,
  FaCertificate,
  FaLaptopCode,
  FaProjectDiagram,
  FaFileAlt,
  FaComments,
  FaChartLine,
  FaFileSignature,
  FaUserGraduate,
} from 'react-icons/fa';
import './WhyChooseUs.css';

const features = [
  {
    icon: FaChalkboardTeacher,
    title: 'Industry Experts',
    description: 'Learn from experienced professionals with years of industry experience and teaching expertise.',
  },
  {
    icon: FaBriefcase,
    title: 'Placement Assistance',
    description: 'Dedicated placement support with resume building, interview preparation, and job referrals.',
  },
  {
    icon: FaCertificate,
    title: 'Certification',
    description: 'Industry-recognized certificates that validate your skills and enhance your resume.',
  },
  {
    icon: FaLaptopCode,
    title: 'Practical Learning',
    description: 'Hands-on projects and real-world assignments to build practical, job-ready skills.',
  },
  {
    icon: FaProjectDiagram,
    title: 'Real Projects',
    description: 'Work on live projects and build a strong portfolio that showcases your capabilities.',
  },
  {
    icon: FaFileAlt,
    title: 'Interview Preparation',
    description: 'Comprehensive interview prep with mock interviews, technical rounds, and HR sessions.',
  },
  {
    icon: FaChartLine,
    title: 'Career Guidance',
    description: 'Personalized career counseling to help you choose the right path and achieve your goals.',
  },
  {
    icon: FaFileSignature,
    title: 'Resume Building',
    description: 'Professional resume writing services tailored to your target roles and industries.',
  },
  {
    icon: FaUserGraduate,
    title: 'Mentorship',
    description: 'One-on-one mentorship sessions with industry professionals throughout your journey.',
  },
];

export default function WhyChooseUs() {
  return (
    <div className="why-choose-us">
      {/* Hero Section */}
      <section className="why-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="why-hero-title">Why Choose Connect2EdTech?</h1>
            <p className="why-hero-subtitle">
              We are committed to providing the best learning experience with industry-aligned curriculum,
              expert mentors, and comprehensive placement support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
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
            <h2>Ready to Transform Your Career?</h2>
            <p>Join thousands of successful professionals who chose Connect2EdTech</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}