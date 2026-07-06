import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from '../shared/SiteLayout'

import HomePage from '../views/HomePage/HomePage'
import AboutPage from '../views/AboutPage/AboutPage'
import CoursesPage from '../views/CoursesPage/CoursesPage'
import CourseDetailsPage from '../views/CourseDetailsPage/CourseDetailsPage'
import EnrollmentPage from '../views/EnrollmentPage/EnrollmentPage'
import CartPage from '../views/CartPage/CartPage'
import ContactPage from '../views/ContactPage/ContactPage'
import SignupPage from '../views/SignupPage/SignupPage'

export default function App() {
  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/courses" element={<CoursesDetailsPage />} />
    <Route path="/course/:course" element={<CourseDetailsPage />} />
        <Route path="/enrollment" element={<EnrollmentPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signup" element={<SignupPage />} />


        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </SiteLayout>
  )
}


