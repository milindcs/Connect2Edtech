// Defaults to a relative URL so the app works on any origin the backend is
// served from (e.g. renaming the Render service won't break API calls).
// Set VITE_API_URL to point at a different backend (e.g. http://localhost:10000 in dev).
export const API_BASE = import.meta.env.VITE_API_URL || ""

let cachedSessionId

function getSessionId() {
  if (cachedSessionId) return cachedSessionId

  // Stable session-id for cart identity across requests.
  // Prefer sessionStorage; if unavailable, fall back to localStorage.
  try {
    let sid = sessionStorage.getItem('guest-cart-session-id')
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('guest-cart-session-id', sid)
    }
    cachedSessionId = sid
    return sid
  } catch {
    // ignore
  }

  try {
    let sid = localStorage.getItem('guest-cart-session-id')
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem('guest-cart-session-id', sid)
    }
    cachedSessionId = sid
    return sid
  } catch {
    // last resort: per-reload random
    cachedSessionId = 'guest-' + Date.now()
    return cachedSessionId
  }
}

async function apiFetch(path, options = {}) {
  const sessionId = getSessionId()
  const headers = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(options.headers || {}),
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

export async function cartList() {
  return apiFetch('/api/cart')
}

export async function cartAdd({ courseKey, title, price, image }) {
  return apiFetch('/api/cart/add', {
    method: 'POST',
    body: JSON.stringify({ courseKey, title, price, image }),
  })
}

export async function cartRemove(courseKey) {
  return apiFetch(`/api/cart/${encodeURIComponent(courseKey)}`, { method: 'DELETE' })
}

export async function cartClear() {
  return apiFetch('/api/cart', { method: 'DELETE' })
}

export async function checkoutSubmit(payload) {
  const res = await apiFetch('/api/checkout/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res
}

export async function signupSubmit(payload) {
  const res = await apiFetch('/api/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res
}

export async function enrollmentSubmit(payload) {
  const res = await apiFetch('/api/enrollment', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res
}

