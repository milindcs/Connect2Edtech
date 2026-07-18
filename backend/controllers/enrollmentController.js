import Enrollment from '../models/Enrollment.js';

export const createEnrollment = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      college,
      qualification,
      city,
      state,
      courseSelected,
      message,
    } = req.body;

    if (!fullName || !email || !phone || !courseSelected) {
      return res.status(400).json({
        ok: false,
        error: 'Full name, email, phone, and course are required fields.',
      });
    }

    const enrollment = await Enrollment.create({
      fullName,
      email,
      phone,
      college: college || '',
      qualification: qualification || '',
      city: city || '',
      state: state || '',
      courseSelected,
      message: message || '',
      source: 'website',
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('user-agent') || '',
    });

    return res.status(201).json({
      ok: true,
      message: 'Enrollment submitted successfully!',
      data: enrollment,
    });
  } catch (error) {
    console.error('Enrollment creation error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to submit enrollment. Please try again.',
    });
  }
};

export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({}).sort({ createdAt: -1 }).limit(500);
    return res.json({ ok: true, data: enrollments });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch enrollments.' });
  }
};

export const getEnrollmentStats = async (req, res) => {
  try {
    const total = await Enrollment.countDocuments();
    const recent = await Enrollment.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    return res.json({ ok: true, data: { total, recent } });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch stats.' });
  }
};