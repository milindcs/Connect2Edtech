export const WHATSAPP_PHONE = '917019436720'

export function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

export function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}
