import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import Home from './pages/Home';
import About from './pages/About';
import WhyChooseUs from './pages/WhyChooseUs';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Contact from './pages/Contact';
import Enrollment from './pages/Enrollment';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/why-choose-us" element={<WhyChooseUs />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseKey" element={<CourseDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/enroll" element={<Enrollment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}