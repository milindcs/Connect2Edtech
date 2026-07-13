import express from 'express'
import bcrypt from 'bcryptjs'

// Signup always creates a standard "user". Privileged roles (hr/admin) can only
// be granted via the admin role-management endpoint to prevent privilege escalation.
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// connectStore is the store "find" helper: connectStore(collection, query) -> array
async function findAccountByEmail(connectStore, email) {
  const matches = await connectStore('signups', {
    email: new RegExp(`^${escapeRegExp(email)}$`, 'i'),
  })
  if (Array.isArray(matches)) return matches[0] || null
  return matches || null
}

export function createSignupRouter({ connectStore, createDocument, updateById, sendOtpEmail }) {
  const router = express.Router()

  router.post('/', async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        password,
        confirmPassword,
        role,
        whatsappNumber,
        connectWhatsapp,
      } = req.body || {}

      const cleanName = typeof name === 'string' ? name.trim() : ''
      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
      const cleanPhone = typeof phone === 'string' ? phone.trim() : ''
      const cleanPassword = typeof password === 'string' ? password : ''

      const missingFields = []
      if (!cleanName) missingFields.push('name')
      if (!isValidEmail(cleanEmail)) missingFields.push('email')
      if (!cleanPhone) missingFields.push('phone')
      if (!cleanPassword) missingFields.push('password')

      if (missingFields.length > 0) {
        return res.status(400).json({
          ok: false,
          error: 'Please provide all required fields.',
          fields: missingFields,
        })
      }

      if (confirmPassword !== undefined && cleanPassword !== String(confirmPassword)) {
        return res.status(400).json({ ok: false, error: 'Passwords do not match.' })
      }

      const userRole = 'user'
      const linkedWhatsapp = connectWhatsapp
        ? String(whatsappNumber || cleanPhone).trim()
        : ''

      const existing = await findAccountByEmail(connectStore, cleanEmail)

      if (existing) {
        if (existing.verified) {
          return res.status(409).json({
            ok: false,
            error: 'An account with this email already exists.',
            code: 'EMAIL_EXISTS',
          })
        }

        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(cleanPassword, salt)
        const otp = generateOtp()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

        await updateById('signups', existing._id, {
          name: cleanName,
          phone: cleanPhone,
          passwordHash,
          role: userRole,
          whatsappNumber: linkedWhatsapp || existing.whatsappNumber || '',
          otp,
          otpExpiry,
          verified: false,
        })

        try {
          await sendOtpEmail(cleanEmail, otp)
        } catch (mailErr) {
          console.error('[Mail] OTP send failed:', mailErr.message)
        }

        return res.status(200).json({
          ok: true,
          requiresVerification: true,
          email: cleanEmail,
          message: 'Account updated. Please verify your email.',
          ...(process.env.NODE_ENV === 'production' ? {} : { devOtp: otp }),
        })
      }

      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(cleanPassword, salt)
      const otp = generateOtp()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      await createDocument('signups', {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: userRole,
        whatsappNumber: linkedWhatsapp,
        otp,
        otpExpiry,
        verified: false,
      })

      try {
        await sendOtpEmail(cleanEmail, otp)
      } catch (mailErr) {
        console.error('[Mail] OTP send failed:', mailErr.message)
      }

      return res.status(200).json({
        ok: true,
        requiresVerification: true,
        email: cleanEmail,
        message: 'Account created. Please verify your email.',
        ...(process.env.NODE_ENV === 'production' ? {} : { devOtp: otp }),
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ok: false, error: 'Signup failed. Please try again.' })
    }
  })

  return router
}

export default createSignupRouter
