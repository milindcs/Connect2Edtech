import React from 'react'
import DashboardShell from '../../views/shared/dashboard/DashboardShell'
import ChartCards from '../../views/shared/dashboard/ChartCards'
import DataTable from '../../views/shared/dashboard/DataTable'

const chartStats = [
  { label: "Courses", value: 8 },
  { label: "Completed", value: 5 },
  { label: "Certificates", value: 5 },
  { label: "Pending", value: 3 },
]

const columns = [
  {
    header: "Course",
    cell: row => row.course,
    searchKey: "course",
  },
  {
    header: "Trainer",
    cell: row => row.trainer,
    searchKey: "trainer",
  },
  {
    header: "Status",
    cell: row => row.status,
    searchKey: "status",
  },
]

const courses = [
  { course: "Full Stack Development", trainer: "John Doe", status: "In Progress" },
  { course: "Data Science", trainer: "Jane Smith", status: "Completed" },
  { course: "React Basics", trainer: "Mike Johnson", status: "In Progress" },
  { course: "Python Programming", trainer: "Sarah Lee", status: "Pending" },
]

const stats = [
  { label: 'My Courses', value: chartStats[0].value },
  { label: 'Completed', value: chartStats[1].value },
  { label: 'Certificates', value: chartStats[2].value },
  { label: 'Pending', value: chartStats[3].value },
]

export default function UserDashboard() {
  return (
    <DashboardShell
      title="User Dashboard"
      roleLabel="Student"
      stats={stats}
    >
      <ChartCards stats={chartStats} />

      <DataTable
        title="My Courses"
        rows={courses}
        columns={columns}
      />
    </DashboardShell>
  )
}