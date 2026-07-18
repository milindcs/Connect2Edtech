import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    college: { type: String, default: '', trim: true, maxlength: 200 },
    qualification: { type: String, default: '', trim: true, maxlength: 200 },
    city: { type: String, default: '', trim: true, maxlength: 100 },
    state: { type: String, default: '', trim: true, maxlength: 100 },
    courseSelected: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, default: '', trim: true, maxlength: 1000 },
    source: { type: String, default: 'website', trim: true },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

enrollmentSchema.index({ email: 1, courseSelected: 1 });
enrollmentSchema.index({ createdAt: -1 });

export default mongoose.model('Enrollment', enrollmentSchema);