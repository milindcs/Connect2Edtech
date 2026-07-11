export const API_BASE = import.meta.env.VITE_API_URL || ""

export function cartList() {
  return Promise.resolve({ ok: true, items: [] })
}

export function cartAdd() {
  return Promise.resolve({ ok: true, items: [] })
}

export function cartRemove() {
  return Promise.resolve({ ok: true, items: [] })
}

export function cartClear() {
  return Promise.resolve({ ok: true })
}

export async function enrollmentSubmit(payload) {
  const res = await fetch(API_BASE + '/api/enrollment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json().catch(() => ({}))
}
