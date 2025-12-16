import express from 'express';
import {
  getJobs,
  getRecentJobs,
  searchJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
  getMyJobs,
  getMyAppliedJobs,
  getJobApplicants,
  getAllJobsAdmin,
} from '../controllers/jobController';
import { protect, optionalAuth } from '../middleware/auth';

const router = express.Router();

router.get('/', optionalAuth, getJobs);
router.get('/recent', optionalAuth, getRecentJobs);
router.get('/search', optionalAuth, searchJobs);
router.get('/my-jobs', protect, getMyJobs);
router.get('/my-applied-jobs', protect, getMyAppliedJobs);
router.get('/admin/all-jobs', protect, getAllJobsAdmin);
router.get('/:id', optionalAuth, getJob);
router.get('/:id/applicants', protect, getJobApplicants);
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.post('/:id/apply', optionalAuth, applyForJob);

export default router;
