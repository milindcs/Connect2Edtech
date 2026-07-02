import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from '../shared/SiteLayout'

import HomePage from '../views/HomePage/HomePage'
import AboutPage from '../views/AboutPage/AboutPage'
import CoursesPage from '../views/CoursesPage/CoursesPage'
import CourseDetailsPage from '../views/CourseDetailsPage/CourseDetailsPage'
import EnrollmentPage from '../views/EnrollmentPage/EnrollmentPage'
import CartPage from '../views/CartPage/CartPage'
import CheckoutPage from '../views/CheckoutPage/CheckoutPage'
import ContactPage from '../views/ContactPage/ContactPage'
import CertificationsPage from '../views/CertificationsPage/CertificationsPage'
import VerifyCertificatePage from '../views/VerifyCertificatePage/VerifyCertificatePage'
import ReceiveCertificatePage from '../views/ReceiveCertificatePage/ReceiveCertificatePage'
import SignupPage from '../views/SignupPage/SignupPage'
import AllImagesPage from '../views/AllImagesPage/AllImagesPage'

export default function App() {
  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/course/:course" element={<CourseDetailsPage />} />
        <Route path="/enrollment" element={<EnrollmentPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/certifications" element={<CertificationsPage />} />
        <Route path="/verify-certificate" element={<VerifyCertificatePage />} />
        <Route path="/receive-certificate" element={<ReceiveCertificatePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/all-images" element={<AllImagesPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SiteLayout>
  )
}


