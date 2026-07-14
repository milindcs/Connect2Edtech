import { getDb } from '../mongoClient.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const email = (process.env.ADMIN_EMAIL || 'hr@connect2future.com').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD || '@2026C2f'
const name = process.env.ADMIN_NAME || 'Connect2Edtech Admin'

async function main() {
  const db = await getDb()
  const coll = db.collection('signups')
  const existing = await coll.findOne({ email })
  const passwordHash = await bcrypt.hash(password, 10)

  if (existing) {
    await coll.updateOne(
      { email },
      {
        $set: {
          role: 'admin',
          verified: true,
          passwordHash,
          name,
          phone: existing.phone || '7019426720',
          whatsappNumber: existing.whatsappNumber || '917019426720',
        },
      }
    )
    console.log(`✅ Updated admin user in MongoDB: ${email}`)
  } else {
    await coll.insertOne({
      name,
      email,
      phone: '7019426720',
      passwordHash,
      role: 'admin',
      verified: true,
      whatsappNumber: '917019426720',
      createdAt: new Date(),
    })
    console.log(`✅ Created admin user in MongoDB: ${email}`)
  }

  const count = await coll.countDocuments()
  console.log(`   signups collection now has ${count} document(s)`)
  process.exit(0)
}

main().catch((e) => {
  console.error('❌ Failed to add admin to MongoDB:', e.message)
  process.exit(1)
})
