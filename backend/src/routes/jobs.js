import express from 'express';
import {
  listJobs, getJob, createJob, updateJob, deleteJob,
  applyJob, getMyApplications, toggleSaveJob, getSavedJobs,
} from '../controllers/jobController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', listJobs);
router.get('/saved', getSavedJobs);
router.get('/applications', getMyApplications);
router.get('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), getJob);
router.post('/', validate({
  body: {
    title: { type: 'string', required: true, minLen: 2, maxLen: 200 },
    description: { type: 'string', required: true, minLen: 5, maxLen: 10000 },
    company: { type: 'string', maxLen: 200 },
    location: { type: 'string', maxLen: 200 },
    type: { type: 'string' },
    salary: { type: 'string', maxLen: 100 },
    category: { type: 'string', maxLen: 100 },
    requirements: { type: 'array' },
    benefits: { type: 'array' },
    skills: { type: 'array' },
  },
}), createJob);

router.post('/:id/apply', validate({ params: { id: { type: 'uuid', required: true } } }), applyJob);
router.post('/:id/save', validate({ params: { id: { type: 'uuid', required: true } } }), toggleSaveJob);
router.put('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), updateJob);
router.delete('/:id', validate({ params: { id: { type: 'uuid', required: true } } }), deleteJob);

export default router;