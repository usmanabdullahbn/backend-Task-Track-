import express from 'express';
import { exportAllData } from '../controllers/exportController.js';

const router = express.Router();

// Route to export all data as Excel
router.get('/all-data', exportAllData);

export default router;