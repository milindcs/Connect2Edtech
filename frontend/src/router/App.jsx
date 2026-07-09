import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from '../shared/SiteLayout'
import { AuthProvider, useAuth } from '../shared/AuthContext'

// Redirect the generic "Dashboard" link to the user's actual dashboard by role.
function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/signin" replace />
  const role = user?.role
  const target = role === 'admin' ? '/admin' : role === 'hr' ? '/hr' : '/student'
  return <Navigate to={target} replace />
}

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
import StudentPage from '../views/StudentPage/StudentPage'
import HrDashboard from '../views/HrDashboard/HrDashboard'
import MailPage from '../views/MailPage/MailPage'

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
          <Route path="/student" element={<StudentPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/hr" element={<HrDashboard />} />
          <Route path="/mail" element={<MailPage />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SiteLayout>
    </AuthProvider>
  )
}


