const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('connect2edtech-user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getAuthHeaders() {
  const stored = getStoredUser();
  const token = stored?.token || localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function fetchDashboardStats() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
    headers,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch stats');
  }
  const data = await res.json();
  return data.stats;
}

export async function fetchStudents() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/dashboard/students`, {
    headers,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch students');
  }
  const data = await res.json();
  return data.students;
}

export async function fetchCourses() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/dashboard/courses`, {
    headers,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch courses');
  }
  const data = await res.json();
  return data.courses;
}

export async function createCourse(courseData) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/dashboard/courses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(courseData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create course');
  }
  const data = await res.json();
  return data.course;
}

export async function updateCourse(courseId, updates) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/dashboard/courses/${courseId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update course');
  }
  const data = await res.json();
  return data.course;
}

export async function deleteCourse(courseId) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/dashboard/courses/${courseId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete course');
  }
  return true;
}

export async function fetchRecentEnrollments() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/dashboard/recent-enrollments`, {
    headers,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch enrollments');
  }
  const data = await res.json();
  return data.recentEnrollments;
}

export async function fetchEnrollments() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/dashboard/enrollments`, {
    headers,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch enrollments');
  }
  const data = await res.json();
  return data.enrollments;
}

export async function fetchContacts() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/dashboard/contacts`, {
    headers,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch contacts');
  }
  const data = await res.json();
  return data.contacts;
}
