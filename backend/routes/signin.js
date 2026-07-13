import express from 'express'
import bcrypt from 'bcryptjs'

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function createSigninRouter({ findOne, signJwt }) {
  const router = express.Router()

  router.post('/', async (req, res) => {
    try {
      const { email, password } = req.body || {}
      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
      const cleanPassword = typeof password === 'string' ? password : ''

      if (!isValidEmail(cleanEmail) || !cleanPassword) {
        return res.status(400).json({ ok: false, error: 'Email and password are required.' })
      }

      const account = await findOne('signups', {
        email: new RegExp(`^${escapeRegExp(cleanEmail)}$`, 'i'),
      })

      if (!account) {
        return res.status(401).json({ ok: false, error: 'Invalid email or password.' })
      }

      const passwordMatches = account.passwordHash
        ? await bcrypt.compare(cleanPassword, account.passwordHash)
        : false

      if (!passwordMatches) {
        return res.status(401).json({ ok: false, error: 'Invalid email or password.' })
      }

      const token = signJwt(account)

      return res.status(200).json({
        ok: true,
        token,
        user: {
          name: account.name,
          email: account.email,
          phone: account.phone,
          whatsappNumber: account.whatsappNumber || '',
          verified: account.verified,
          role: account.role || 'user',
          picture: account.picture || '',
        },
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ok: false, error: 'Sign in failed. Please try again.' })
    }
  })

  return router
}

export default createSigninRouter
