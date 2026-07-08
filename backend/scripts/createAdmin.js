import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function connectMongo() {
  mongoose.set('strictQuery', true);
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/connect2edtech';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 5000 });
}

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'admin' },
  otp: { type: String, default: '' },
  otpExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

const Admin = mongoose.model('SignupSubmission', AdminSchema);

async function main() {
  try {
    await connectMongo();
    console.log('[MongoDB] connected');

    const email = 'hr@connect2future.com';
    const password = '@2026C2f';
    const name = 'HR Admin';
    const phone = '7019436720';

    const existing = await Admin.findOne({ email });
    if (existing) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await Admin.updateOne(
        { _id: existing._id },
        { $set: { passwordHash, role: 'admin', verified: true } }
      );
      console.log(`[Admin] Updated existing admin: ${email}`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await Admin.create({
        name,
        email,
        phone,
        passwordHash,
        role: 'admin',
        verified: true,
      });
      console.log(`[Admin] Created admin: ${email}`);
    }
  } catch (err) {
    console.error('[Admin] Error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('[MongoDB] disconnected');
  }
}

main();
