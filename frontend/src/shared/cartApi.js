// Defaults to a relative URL so the app works on any origin the backend is
// served from (e.g. renaming the Render service won't break API calls).
// Set VITE_API_URL to point at a different backend (e.g. http://localhost:10000 in dev).
export const API_BASE = import.meta.env.VITE_API_URL || ""

const CART_KEY = 'cart_items'

function getCart() {
  try {
    const cart = localStorage.getItem(CART_KEY)
    return cart ? JSON.parse(cart) : []
  } catch {
    return []
  }
}

function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-updated'))
}

export function cartList() {
  return Promise.resolve({ ok: true, items: getCart() })
}

export function cartAdd({ courseKey, title, price, image }) {
  const cart = getCart()
  const existing = cart.find((item) => item.courseKey === courseKey)
  if (existing) {
    Object.assign(existing, { title, price, image, addedAt: new Date().toISOString() })
  } else {
    cart.push({ courseKey, title, price, image, addedAt: new Date().toISOString() })
  }
  setCart(cart)
  return Promise.resolve({ ok: true, items: cart })
}

export function cartRemove(courseKey) {
  const cart = getCart().filter((item) => item.courseKey !== courseKey)
  setCart(cart)
  return Promise.resolve({ ok: true, items: cart })
}

export function cartClear() {
  setCart([])
  return Promise.resolve({ ok: true })
}

let cachedSessionId

function getSessionId() {
  if (cachedSessionId) return cachedSessionId
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

export async function checkoutSubmit(payload) {
  const cart = getCart()
  const result = await apiFetch('/api/checkout/submit', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      clientCartSnapshot: cart,
    }),
  })
  setCart([])
  return result
}

export async function enrollmentSubmit(payload) {
  const result = await apiFetch('/api/enrollment', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return result
}

export async function signupSubmit(payload) {
  const result = await apiFetch('/api/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return result
}
