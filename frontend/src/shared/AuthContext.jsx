import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { API_BASE } from './cartApi'

const AuthContext = createContext(null)

function getInitialUser() {
  try {
    const raw = sessionStorage.getItem('connect2edtech-user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token || !parsed?.user) return null
    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => getInitialUser())

  const user = state?.user || null
  const token = state?.token || null

  useEffect(() => {
    if (!token || !user) {
      if (state) {
        sessionStorage.removeItem('connect2edtech-user')
      }
      return
    }
    sessionStorage.setItem('connect2edtech-user', JSON.stringify({ token, user }))
  }, [token, user, state])

  const apiFetch = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const res = await fetch(API_BASE + path, {
      ...options,
      headers,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `Request failed: ${res.status}`)
    }
    return res.json().catch(() => ({}))
  }

  const signup = async (payload) => {
    const data = await apiFetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (!data.ok) throw new Error(data.error || 'Signup failed')
    return data
  }

  const verifyOtp = async (email, otp) => {
    const data = await apiFetch('/api/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })
    if (!data.ok) throw new Error(data.error || 'Verification failed')
    if (data.token && data.user) {
      setState({ token: data.token, user: data.user })
    }
    return data
  }

  const resendOtp = async (email) => {
    const data = await apiFetch('/api/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    if (!data.ok) throw new Error(data.error || 'Resend failed')
    return data
  }

  const signin = async (email, password) => {
    const data = await apiFetch('/api/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (!data.ok) throw new Error(data.error || 'Sign in failed')
    if (data.token && data.user) {
      setState({ token: data.token, user: data.user })
    }
    return data
  }

  const fetchMe = async () => {
    const data = await apiFetch('/api/auth/me')
    if (!data.ok) throw new Error(data.error || 'Failed to fetch user')
    return data
  }

  const signout = () => {
    setState(null)
    sessionStorage.removeItem('connect2edtech-user')
  }

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    signup,
    verifyOtp,
    resendOtp,
    signin,
    fetchMe,
    signout,
  }), [token, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
