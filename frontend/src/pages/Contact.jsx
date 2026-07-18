import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { contactApi } from '../utils/api';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({ submitting: false, submitted: false, error: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, submitted: false, error: '' });

    try {
      const response = await contactApi.create(formData);
      if (response.data?.ok) {
        setStatus({ submitting: false, submitted: true, error: '' });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

        setTimeout(() => setStatus((prev) => ({ ...prev, submitted: false })), 5000);
      } else {
        setStatus({
          submitting: false,
          submitted: false,
          error: response.data?.error || 'Failed to submit. Please try again.',
        });
      }
    } catch (error) {
      setStatus({
        submitting: false,
        submitted: false,
        error: 'Something went wrong. Please try again later.',
      });
    }
  };

  const contactInfo = [
    {
      icon: FaEnvelope,
      label: 'Email',
      value: 'hr@connect2future.com',
      href: 'mailto:hr@connect2future.com',
    },
    {
      icon: FaPhone,
      label: 'Phone',
      value: '+91 7019436720',
      href: 'tel:+917019436720',
    },
    {
      icon: FaInstagram,
      label: 'Instagram',
      value: '@the_c2f_',
      href: 'https://www.instagram.com/the_c2f_?igsh=ZzU5OTRkYjl4ZHJj',
    },
    {
      icon: FaLinkedin,
      label: 'LinkedIn',
      value: 'Connect2EdTech',
      href: 'https://www.linkedin.com/company/connect2edtech/',
    },
  ];

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">
              Have questions? We are here to help. Reach out to us anytime.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="contact-page-content">
        <section className="section">
          <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-info-card"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="contact-info-icon">
                    <item.icon />
                  </div>
                  <div>
                    <h4>{item.label}</h4>
                    <p>{item.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            <motion.div
              className="contact-form-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2>Send us a message</h2>

              {status.submitted && (
                <div className="alert-success">
                  Thank you! Your message has been sent successfully. We will get back to you soon.
                </div>
              )}

              {status.error && <div className="alert-error">{status.error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
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

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter subject"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="form-textarea"
                    placeholder="How can we help you?"
                    rows="5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status.submitting}
                  className="btn btn-primary btn-block"
                >
                  {status.submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
          </div>
        </section>
      </div>
    </div>
  );
}
