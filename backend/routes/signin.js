import express from 'express'
import bcrypt from 'bcryptjs'

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

// Hardcoded staff account for direct admin dashboard access. Override via env vars.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'hr@connect2future.com').trim().toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '@2026C2f'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Connect2Edtech Admin'

function isHardcodedAdmin(email, password) {
  return (
    email === ADMIN_EMAIL &&
    password === ADMIN_PASSWORD
  )
}

export function createSigninRouter({ findOne, signJwt, upsertOne }) {
  const router = express.Router()

  router.post('/', async (req, res) => {
    try {
      const { email, password } = req.body || {}
      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
      const cleanPassword = typeof password === 'string' ? password : ''

      if (!isValidEmail(cleanEmail) || !cleanPassword) {
        return res.status(400).json({ ok: false, error: 'Email and password are required.' })
      }

      // Hardcoded staff account: grants admin dashboard access without a DB record.
      if (isHardcodedAdmin(cleanEmail, cleanPassword)) {
        // Sync the hardcoded admin into the signups collection so it appears
        // in dashboards and behaves like a normal user.
        try {
          const passwordHash = await bcrypt.hash(cleanPassword, 10)
          await upsertOne('signups', { email: ADMIN_EMAIL }, {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            phone: '7019426720',
            passwordHash,
            role: 'admin',
            verified: true,
            whatsappNumber: '917019426720',
          })
        } catch (syncErr) {
          console.error('Failed to sync hardcoded admin to signups:', syncErr.message)
        }

        const adminAccount = {
          _id: 'admin-bootstrap',
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          phone: '',
          verified: true,
          role: 'admin',
        }
        const token = signJwt(adminAccount)
        return res.status(200).json({
          ok: true,
          token,
          user: {
            name: adminAccount.name,
            email: adminAccount.email,
            phone: adminAccount.phone,
            whatsappNumber: '',
            verified: adminAccount.verified,
            role: adminAccount.role,
            picture: '',
          },
        })
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
