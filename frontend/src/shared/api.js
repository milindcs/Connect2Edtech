import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('connect2edtech-user')
  if (token) {
    try {
      const parsed = JSON.parse(token)
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`
      }
    } catch {
      // ignore
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''

    if (status === 401) {
      // Only force redirect for actual authentication endpoints that should never
      // return 401 while the user is successfully authenticated. For everything
      // else, just clear the stored credentials and let the UI handle it.
      const authPaths = ['/api/auth/signin', '/api/auth/google', '/api/auth/signup']
      const isAuthEndpoint = authPaths.some((p) => url.includes(p))

      if (isAuthEndpoint) {
        localStorage.removeItem('connect2edtech-user')
        window.location.href = '/signin'
      } else {
        // For non-auth endpoints (e.g. /api/enrollment, /api/contact, etc.),
        // clear stale tokens without an aggressive redirect so public pages
        // don't bounce logged-out users unexpectedly.
        localStorage.removeItem('connect2edtech-user')
      }
    }

    return Promise.reject(error)
  }
)

export default api
