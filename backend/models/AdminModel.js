export function normalizeStudent(doc = {}) {
  return {
    _id: doc._id,
    userId: doc.userId || doc._id?.toString() || '',
    name: doc.name || '',
    email: doc.email || '',
    phone: doc.phone || '',
    course: doc.course || '',
    courseKey: doc.courseKey || '',
    status: doc.status || 'Active',
    createdAt: doc.createdAt || new Date(),
  };
}

export function normalizeCourse(doc = {}) {
  return {
    _id: doc._id,
    title: doc.title || '',
    duration: doc.duration || '',
    fee: doc.fee || '',
    trainer: doc.trainer || '',
    description: doc.description || '',
    image: doc.image || '',
    courseKey: doc.courseKey || doc._id?.toString() || '',
    students: doc.students || 0,
    status: doc.status || 'Active',
    createdAt: doc.createdAt || new Date(),
  };
}

export function normalizeContact(doc = {}) {
  return {
    _id: doc._id,
    name: doc.name || '',
    email: doc.email || '',
    phone: doc.phone || '',
    message: doc.message || '',
    courses: doc.courses || '',
    replies: Array.isArray(doc.replies) ? doc.replies : [],
    replied: !!doc.replied,
    createdAt: doc.createdAt || new Date(),
  };
}

export function normalizeDashboardStat(doc = {}) {
  return {
    _id: doc._id,
    label: doc.label || '',
    value: typeof doc.value === 'number' ? doc.value : parseInt(doc.value, 10) || 0,
    updatedAt: doc.updatedAt || new Date(),
  };
}