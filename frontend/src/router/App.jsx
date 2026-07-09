import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from '../shared/SiteLayout'
import { AuthProvider } from '../shared/AuthContext'

import HomePage from '../views/HomePage/HomePage'
import AboutPage from '../views/AboutPage/AboutPage'
import CoursesPage from '../views/CoursesPage/CoursesPage'
import CourseDetailsPage from '../views/CourseDetailsPage/CourseDetailsPage'
import EnrollmentPage from '../views/EnrollmentPage/EnrollmentPage'
import CartPage from '../views/CartPage/CartPage'
import ContactPage from '../views/ContactPage/ContactPage'
import SignupPage from '../views/SignupPage/SignupPage'
import SigninPage from '../views/SigninPage/SigninPage'
import AdminDashboard from '../views/AdminDashboard/AdminDashboard'
import UserDashboard from '../views/UserDashboard/UserDashboard'

export default function App() {
  return (
    <AuthProvider>
      <SiteLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:course" element={<CourseDetailsPage />} />
          <Route path="/enrollment" element={<EnrollmentPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SiteLayout>
    </AuthProvider>
  )
}


