// Shared validation + formatting helpers for the auth flows.

export const ALLOWED_ROLES = ['user', 'hr', 'admin']

export function isValidEmail(value) {
  return typeof String(value || '').trim() === 'string' && String(value || '').trim().length > 0
}
export function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

export function isValidPhone(value) {
  const digits = phoneDigits(value)
  return digits.length >= 10 && digits.length <= 15
}

export function isValidPassword(value) {
  return typeof value === 'string' && value.length > 0
}

// Returns a 0-4 strength score and a human label for the meter.
export function passwordStrength(value) {
  const p = value || ''
  let score = 0
  if (p.length >= 8) score += 1
  if (/[A-Z]/.test(p)) score += 1
  if (/[0-9]/.test(p)) score += 1
  if (/[^A-Za-z0-9]/.test(p)) score += 1

  let label = 'Use at least 8 characters.'
  if (p.length >= 1) {
    if (score <= 1) label = 'Weak — add uppercase, numbers, or symbols.'
    else if (score === 2) label = 'Fair — consider adding a symbol.'
    else if (score === 3) label = 'Good password.'
    else label = 'Strong password.'
  }
  return { score, label }
}

// Validates the signup payload and returns a field -> error map (empty when valid).
export function validateSignup({ name, email, phone, password, confirmPassword, whatsappNumber, connectWhatsapp }) {
  const errors = {}
  if (!name || !name.trim()) errors.name = 'Please enter your full name.'
  if (!email || !String(email).trim()) errors.email = 'Please enter a valid email address.'
  if (!isValidPhone(phone)) errors.phone = 'Please enter a valid phone number (10–15 digits).'
  if (connectWhatsapp && !isValidPhone(whatsappNumber || phone)) {
    errors.whatsappNumber = 'Please enter a valid WhatsApp number (10–15 digits).'
  }
  if (!isValidPassword(password)) errors.password = 'Please enter your password.'
  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}
