import Contact from '../models/Contact.js';

export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        error: 'Name, email, and message are required fields.',
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone: phone || '',
      subject: subject || '',
      message,
      source: 'website',
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('user-agent') || '',
    });

    return res.status(201).json({
      ok: true,
      message: 'Contact message submitted successfully!',
      data: contact,
    });
  } catch (error) {
    console.error('Contact creation error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to submit contact message. Please try again.',
    });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 }).limit(500);
    return res.json({ ok: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch contacts.' });
  }
};