export const WHATSAPP_PHONE = '917019426720'

// Both official contact numbers, usable for WhatsApp chat.
export const WHATSAPP_PHONES = ['917019426720', '917019045849']

export function buildWhatsAppUrl(message) {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`
}

export function buildWhatsAppUrlFor(phone, message) {
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
}

export function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}
