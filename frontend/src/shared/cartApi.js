export const API_BASE = import.meta.env.VITE_API_BASE || 'https://connect2edtech.onrender.com'

function getSessionId() {
  // best-effort guest cart id; no local persistence required for cart items
  // If sessionStorage is not available, fallback to a random per reload.
  try {
    let sid = sessionStorage.getItem('guest-cart-session-id')
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('guest-cart-session-id', sid)
    }
    return sid
  } catch {
    return 'guest-' + Date.now()
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

