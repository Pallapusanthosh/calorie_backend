import express from 'express';
import { calculateCalorieTarget } from '../controllers/calorieController.js';
import  auth  from '../middleware/auth.js';

const router = express.Router();

router.post('/calculate', auth, calculateCalorieTarget);

export default router; 