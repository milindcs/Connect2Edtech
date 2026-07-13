import React from "react";
import DashboardShell from "../shared/dashboard/DashboardShell";
import ChartCards from "../shared/dashboard/ChartCards";
import DataTable from "../shared/dashboard/DataTable";

const stats = [
  { label: "Students", value: 245 },
  { label: "HR Users", value: 18 },
  { label: "Courses", value: 32 },
  { label: "Enrollments", value: 612 },
];

const students = [
  {
    _id: "1",
    name: "Rahul Kumar",
    email: "rahul@gmail.com",
    phone: "9876543210",
    course: "Full Stack Development",
    status: "Active",
  },
  {
    _id: "2",
    name: "Priya Sharma",
    email: "priya@gmail.com",
    phone: "9876543211",
    course: "Data Science",
    status: "Active",
  },
  {
    _id: "3",
    name: "Arjun R",
    email: "arjun@gmail.com",
    phone: "9876543212",
    course: "UI/UX Design",
    status: "Pending",
  },
];

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

const courses = [
  {
    _id: "1",
    title: "Full Stack Development",
    duration: "6 Months",
    fee: "₹35,000",
    trainer: "John David",
  },
  {
    _id: "2",
    title: "Data Science",
    duration: "5 Months",
    fee: "₹40,000",
    trainer: "Priya Sharma",
  },
  {
    _id: "3",
    title: "UI/UX Design",
    duration: "3 Months",
    fee: "₹25,000",
    trainer: "Anjali Rao",
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
        <button className="btn primary">
          Edit
        </button>

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

export default function AdminDashboard() {
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
            <li>✅ New student registered</li>
            <li>📚 New course added</li>
            <li>🎓 Certificate approved</li>
            <li>👤 HR account created</li>
            <li>💬 Contact message received</li>
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
            <button className="btn secondary">🎓 Certificates</button>
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
      />

      <DataTable
        title="Courses"
        subtitle="Manage available courses"
        rows={courses}
        columns={courseColumns}
        filterTextPlaceholder="Search courses..."
      />
    </DashboardShell>
  );
}
