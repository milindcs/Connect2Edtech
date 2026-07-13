export const CERTIFICATE_STATUSES = ['pending', 'issued', 'rejected'];

export function normalizeCertificateRequest(doc = {}) {
  return {
    _id: doc._id,
    userId: doc.userId || '',
    userName: doc.userName || '',
    userEmail: doc.userEmail || '',
    courseKey: doc.courseKey || '',
    courseTitle: doc.courseTitle || '',
    status: CERTIFICATE_STATUSES.includes(doc.status) ? doc.status : 'pending',
    issuedAt: doc.issuedAt || null,
    certificateId: doc.certificateId || '',
    createdAt: doc.createdAt || new Date(),
  };
}
