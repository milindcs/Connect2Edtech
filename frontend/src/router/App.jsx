import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from '../shared/SiteLayout'
import { AuthProvider, useAuth } from '../shared/AuthContext'

// Redirect the generic "Dashboard" link to the user's actual dashboard by role.
function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/signin" replace />
  const role = user?.role
  const target =
    role === 'admin' ? '/admin'
    : role === 'hr' ? '/hr'
    : role === 'student' || role === 'user' ? '/user'
    : '/'
  return <Navigate to={target} replace />
}

import HomePage from '../views/HomePage/HomePage'
import AboutPage from '../views/AboutPage/AboutPage'
import CoursesPage from '../views/CoursesPage/CoursesPage'
import CourseDetailsPage from '../views/CourseDetailsPage/CourseDetailsPage'
import EnrollmentPage from '../views/EnrollmentPage/EnrollmentPage'
import ContactPage from '../views/ContactPage/ContactPage'
import SignupPage from '../views/SignupPage/SignupPage'
import SigninPage from '../views/SigninPage/SigninPage'
import AdminDashboard from '../views/AdminDashboard/AdminDashboard'
import AdminRoute from '../views/AdminDashboard/AdminRoute'
import StudentPage from '../views/StudentPage/StudentPage'
import UserDashboard from '../pages/user/UserDashboard'
import HrDashboard from '../views/HrDashboard/HrDashboard'
import MailPage from '../views/MailPage/MailPage'
import NotFoundPage from '../views/NotFoundPage'

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
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/student" element={<StudentPage />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/hr" element={<AdminRoute><HrDashboard /></AdminRoute>} />
          <Route path="/mail" element={<MailPage />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SiteLayout>
    </AuthProvider>
  )
}


