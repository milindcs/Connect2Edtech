import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)

function getInitialUser() {
  try {
    const raw = localStorage.getItem('connect2edtech-user')
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
        localStorage.removeItem('connect2edtech-user')
      }
      return
    }
    localStorage.setItem('connect2edtech-user', JSON.stringify({ token, user }))
  }, [token, user, state])

  const apiFetch = async (path, options = {}) => {
    try {
      const res = await api.request({
        url: path,
        method: options.method || 'get',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        data: options.body,
        ...options,
      })
      return res.data
    } catch (err) {
      const message = err?.response?.data?.error || err.message || 'Request failed'
      throw new Error(message)
    }
  }

  // If token exists but user/role might be stale (e.g. refresh), fetch authoritative user.
  useEffect(() => {
    if (!token) return
    const shouldRefresh = !user?.role || !user?.verified
    if (!shouldRefresh) return

    let cancelled = false
    const run = async () => {
      try {
        const me = await apiFetch('/api/auth/me')
        if (cancelled) return
        if (me?.user) setState({ token, user: me.user })
      } catch {
        // ignore; keep existing session state
      }
    }
    run()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role, user?.verified])

  const signup = async (payload) => {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (!data.ok) throw new Error(data.error || 'Signup failed')
    return data
  }

  const verifyOtp = async (email, otp, { autoLogin = true } = {}) => {
    const data = await apiFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })
    if (!data.ok) throw new Error(data.error || 'Verification failed')
    if (autoLogin && data.token && data.user) {
      setState({ token: data.token, user: data.user })
    }
    return data
  }

  const resendOtp = async (email) => {
    const data = await apiFetch('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    if (!data.ok) throw new Error(data.error || 'Resend failed')
    return data
  }

  const signin = async (email, password) => {
    const data = await apiFetch('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (!data.ok) throw new Error(data.error || 'Sign in failed')
    if (data.token && data.user) {
      setState({ token: data.token, user: data.user })
    }
    return data
  }

  const googleSignin = async (idToken) => {
    const data = await apiFetch('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    })
    if (!data.ok) throw new Error(data.error || 'Google sign-in failed')
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
    localStorage.removeItem('connect2edtech-user')
  }

  const value = useMemo(() => ({
    user,
    token,
    role: user?.role || 'user',
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'admin' || user?.role === 'hr',
    signup,
    verifyOtp,
    resendOtp,
    signin,
    googleSignin,
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
