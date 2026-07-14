import express from 'express';
import { createDocument, find, findOne, updateById, deleteOne, countDocuments, upsertOne } from '../store.js';
import { normalizeCourse, normalizeStudent, normalizeContact } from '../models/AdminModel.js';

export function createAdminRouter() {
  const router = express.Router();

  router.get('/stats', async (req, res) => {
    try {
      const totalUsers = await countDocuments('signups')
      const verifiedUsers = await countDocuments('signups', { verified: true })
      const admins = await countDocuments('signups', { role: 'admin' })
      const hrs = await countDocuments('signups', { role: 'hr' })
      const enrollments = await countDocuments('enrollments')
      const contacts = await countDocuments('contacts')
      const courses = await countDocuments('courses')

      const stats = {
        students: totalUsers,
        hrUsers: admins + hrs,
        courses: courses || 0,
        enrollments: enrollments,
        contacts,
      }

      // Persist a snapshot of the dashboard stats into the dedicated
      // "dashboard" collection so the overview is also stored in MongoDB.
      try {
        await upsertOne('dashboard', { type: 'overview' }, {
          stats,
          updatedAt: new Date(),
        })
      } catch (snapshotErr) {
        console.error('Failed to persist dashboard snapshot:', snapshotErr.message)
      }

      res.json({ ok: true, stats })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to load stats.' })
    }
  })

  // Get all students
  router.get('/students', async (req, res) => {
    try {
      const users = await find('signups', {}, { sort: { createdAt: -1 } })
      const students = users.map((u) => normalizeStudent({
        ...u,
        status: u.verified ? 'Active' : 'Pending',
      }))
      res.json({ ok: true, students })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to fetch students.' })
    }
  })

  // Get all courses
  router.get('/courses', async (req, res) => {
    try {
      const courses = await find('courses', {}, { sort: { createdAt: -1 } })
      res.json({ ok: true, courses })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to fetch courses.' })
    }
  })

  // Create course
  router.post('/courses', async (req, res) => {
    try {
      const { title, duration, fee, trainer, description, image, courseKey, students } = req.body || {}
      
      const course = await createDocument('courses', {
        title: String(title || '').trim(),
        duration: String(duration || '').trim(),
        fee: String(fee || '').trim(),
        trainer: String(trainer || '').trim(),
        description: String(description || '').trim(),
        image: String(image || '').trim(),
        courseKey: String(courseKey || '').trim().toLowerCase(),
        students: typeof students === 'number' ? students : parseInt(students, 10) || 0,
      })
      
      res.json({ ok: true, course })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to create course.' })
    }
  })

  // Update course
  router.patch('/courses/:id', async (req, res) => {
    try {
      const { id } = req.params
      const updates = req.body || {}
      
      const course = await updateById('courses', id, { $set: updates })
      if (!course) {
        return res.status(404).json({ ok: false, error: 'Course not found.' })
      }
      
      res.json({ ok: true, course })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to update course.' })
    }
  })

  // Delete course
  router.delete('/courses/:id', async (req, res) => {
    try {
      const { id } = req.params
      const deleted = await deleteOne('courses', { _id: id })
      
      if (!deleted) {
        return res.status(404).json({ ok: false, error: 'Course not found.' })
      }
      
      res.json({ ok: true, message: 'Course deleted successfully.' })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to delete course.' })
    }
  })

  // Get recent enrollments
  router.get('/recent-enrollments', async (req, res) => {
    try {
      const recentEnroll = await find('enrollments', {}, { sort: { createdAt: -1 } })
      res.json({ ok: true, recentEnrollments: recentEnroll })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to fetch recent enrollments.' })
    }
  })

  router.get('/contacts', async (req, res) => {
    try {
      const items = await find('contacts', {}, { sort: { createdAt: -1 } })
      const normalized = items.map((c) => normalizeContact(c))
      res.json({ ok: true, contacts: normalized })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to fetch contacts.' })
    }
  })

  router.get('/enrollments', async (req, res) => {
    try {
      const items = await find('enrollments', {}, { sort: { createdAt: -1 } })
      res.json({ ok: true, enrollments: items })
    } catch (e) {
      console.error(e)
      res.status(500).json({ ok: false, error: 'Failed to fetch enrollments.' })
    }
  })

  return router
}

export default createAdminRouter