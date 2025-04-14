import express from 'express';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';
import { addMeal, getDailyMeals, getMonthlyMeals } from '../controllers/mealcontroller.js';

const router = express.Router();

router.post('/', auth, upload.single('image'), addMeal);
router.get('/daily', auth, getDailyMeals);
router.get('/monthly', auth, getMonthlyMeals);

export default router;
