import express from 'express';
import { createEnrollment, getAllEnrollments, getEnrollmentStats } from '../controllers/enrollmentController.js';

const router = express.Router();

router.post('/', createEnrollment);
router.get('/', getAllEnrollments);
router.get('/stats', getEnrollmentStats);

export default router;