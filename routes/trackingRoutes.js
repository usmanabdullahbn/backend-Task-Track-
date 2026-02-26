import express from 'express';
const router = express.Router();
import { saveLocation, startTask, endTask, getTimeline } from '../controllers/trackingController.js';

router.post('/location', saveLocation);
router.post('/task/start', startTask);
router.post('/task/end', endTask);
router.get('/timeline', getTimeline);

export default router;