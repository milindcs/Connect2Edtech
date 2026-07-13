import React, { useState, useEffect } from "react";
import DashboardShell from "../shared/dashboard/DashboardShell";
import ChartCards from "../shared/dashboard/ChartCards";
import DataTable from "../shared/dashboard/DataTable";
import {
  fetchDashboardStats,
  fetchStudents,
  fetchCourses,
  fetchRecentEnrollments,
  fetchContacts,
  fetchEnrollments,
} from "../../shared/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: "Students", value: 0 },
    { label: "HR Users", value: 0 },
    { label: "Courses", value: 0 },
    { label: "Enrollments", value: 0 },
    { label: "Contact Messages", value: 0 },
  ]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError("");

    try {
      const [
        statsData,
        studentsData,
        coursesData,
        enrollmentsData,
        contactsData,
        allEnrollmentsData,
      ] = await Promise.all([
        fetchDashboardStats(),
        fetchStudents(),
        fetchCourses(),
        fetchRecentEnrollments(),
        fetchContacts(),
        fetchEnrollments(),
      ]);

      setStats([
        { label: "Students", value: statsData.students || 0 },
        { label: "HR Users", value: statsData.hrUsers || 0 },
        { label: "Courses", value: statsData.courses || 0 },
        { label: "Enrollments", value: statsData.enrollments || 0 },
        { label: "Contact Messages", value: statsData.contacts || 0 },
      ]);

      setStudents(studentsData || []);
      setCourses(coursesData || []);
      setRecentEnrollments(enrollmentsData || []);
      setEnrollments(allEnrollmentsData || []);
      setContacts(contactsData || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  const studentColumns = [
    {
      header: "Name",
      searchKey: "name",
      cell: (row) => row.name,
    },
    {
      header: "Email",
      searchKey: "email",
      cell: (row) => row.email,
    },
    {
      header: "Phone",
      searchKey: "phone",
      cell: (row) => row.phone,
    },
    {
      header: "Course",
      searchKey: "course",
      cell: (row) => row.course,
    },
    {
      header: "Status",
      searchKey: "status",
      cell: (row) => (
        <span
          style={{
            color: row.status === "Active" ? "green" : "orange",
            fontWeight: "bold",
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn secondary">View</button>
          <button className="btn primary">Edit</button>
          <button
            className="btn secondary"
            style={{
              background: "#ef4444",
              color: "#fff",
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const courseColumns = [
    {
      header: "Course",
      searchKey: "title",
      cell: (row) => row.title,
    },
    {
      header: "Duration",
      searchKey: "duration",
      cell: (row) => row.duration,
    },
    {
      header: "Fee",
      searchKey: "fee",
      cell: (row) => row.fee,
    },
    {
      header: "Trainer",
      searchKey: "trainer",
      cell: (row) => row.trainer,
    },
    {
      header: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn primary">Edit</button>

          <button
            className="btn secondary"
            style={{
              background: "#ef4444",
              color: "#fff",
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const enrollmentColumns = [
    {
      header: "Student",
      searchKey: "name",
      cell: (row) => row.name,
    },
    {
      header: "Email",
      searchKey: "email",
      cell: (row) => row.email,
    },
    {
      header: "Course",
      searchKey: "courseTitle",
      cell: (row) => row.courseTitle || row.courseKey,
    },
    {
      header: "College",
      searchKey: "college",
      cell: (row) => row.college || "—",
    },
    {
      header: "Enrolled On",
      searchKey: "createdAt",
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn secondary">View</button>
        </div>
      ),
    },
  ];

  const contactColumns = [
    {
      header: "Name",
      searchKey: "name",
      cell: (row) => row.name,
    },
    {
      header: "Email",
      searchKey: "email",
      cell: (row) => row.email,
    },
    {
      header: "Phone",
      searchKey: "phone",
      cell: (row) => row.phone,
    },
    {
      header: "Message",
      searchKey: "message",
      cell: (row) =>
        row.message.length > 60 ? `${row.message.slice(0, 60)}...` : row.message,
    },
    {
      header: "Replied",
      searchKey: "replied",
      cell: (row) => (
        <span
          style={{
            color: row.replied ? "green" : "orange",
            fontWeight: "bold",
          }}
        >
          {row.replied ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Date",
      searchKey: "createdAt",
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  if (loading) {
    return (
      <DashboardShell
        title="Admin Dashboard"
        roleLabel="Administrator"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin Dashboard" },
        ]}
        stats={stats}
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading dashboard data...</p>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell
        title="Admin Dashboard"
        roleLabel="Administrator"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin Dashboard" },
        ]}
        stats={stats}
      >
        <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
          <p>Error: {error}</p>
          <button
            className="btn primary"
            onClick={loadDashboardData}
            style={{ marginTop: "10px" }}
          >
            Retry
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Admin Dashboard"
      roleLabel="Administrator"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Admin Dashboard" },
      ]}
      stats={stats}
    >
      <ChartCards stats={stats} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginTop: "30px",
        }}
      >
        {/* Recent Activity */}
        <div
          className="card"
          style={{
            padding: "24px",
            borderRadius: "16px",
            background: "#fff",
          }}
        >
          <h3>Recent Activity</h3>

          <ul style={{ marginTop: "20px", lineHeight: "2" }}>
            {recentEnrollments.length > 0 ? (
              recentEnrollments.slice(0, 5).map((enrollment, index) => (
                <li key={enrollment._id || index}>
                  ✅ New enrollment: {enrollment.name} -{" "}
                  {enrollment.courseTitle || "No course"}
                </li>
              ))
            ) : (
              <>
                <li>✅ New student registered</li>
                <li>📚 New course added</li>
                <li>👤 HR account created</li>
                <li>💬 Contact message received</li>
              </>
            )}
          </ul>
        </div>

        {/* Quick Actions */}
        <div
          className="card"
          style={{
            padding: "24px",
            borderRadius: "16px",
            background: "#fff",
          }}
        >
          <h3>Quick Actions</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            <button className="btn primary">➕ Add Course</button>
            <button className="btn secondary">👥 Manage Students</button>
            <button className="btn secondary">🧑‍💼 Manage HR</button>
            <button className="btn secondary">📩 Contact Messages</button>
            <button className="btn secondary">📊 Reports</button>
          </div>
        </div>
      </div>

      <DataTable
        title="Students"
        subtitle="Manage all registered students"
        rows={students}
        columns={studentColumns}
        filterTextPlaceholder="Search students..."
        selectable
      />

      <DataTable
        title="Courses"
        subtitle="Manage available courses"
        rows={courses}
        columns={courseColumns}
        filterTextPlaceholder="Search courses..."
        selectable
      />

      <DataTable
        title="Enrollments"
        subtitle="All course enrollments"
        rows={enrollments}
        columns={enrollmentColumns}
        filterTextPlaceholder="Search enrollments..."
        selectable
      />

      <DataTable
        title="Contact Messages"
        subtitle="Latest inquiries and messages from users"
        rows={contacts}
        columns={contactColumns}
        filterTextPlaceholder="Search contacts..."
        selectable
      />
    </DashboardShell>
  );
}
