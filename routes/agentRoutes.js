import express from 'express';
import auth from '../middleware/auth.js';
import { chatAgent } from '../controllers/agentcontroller.js';
import { dailyAdvice } from '../controllers/agentdailycontroller.js';
import { mealRecommendation } from '../controllers/agentrecommendationcontroller.js';




const router = express.Router();


router.post('/chat',  chatAgent);
router.get('/daily-advice' , dailyAdvice);
router.post('/recommendation', mealRecommendation);


export default router;
