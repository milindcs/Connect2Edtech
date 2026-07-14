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
    // Don't force a redirect for the background auth-refresh check or optional
    // requests — that would bounce guests off public pages (e.g. the homepage).
    const url = error?.config?.url || ''
    if (status === 401) {
      if (url.includes('/api/auth/me')) {
        // Stale/invalid token: clear it so the UI reflects a logged-out state
        // instead of showing a broken "authenticated" experience.
        localStorage.removeItem('connect2edtech-user')
      } else {
        localStorage.removeItem('connect2edtech-user')
        window.location.href = '/signin'
      }
    }
    return Promise.reject(error)
  }
)

export default api
