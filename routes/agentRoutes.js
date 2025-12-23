import express from 'express';
import auth from '../middleware/auth.js';
import { chatAgent } from '../controllers/agentcontroller.js';
import { dailyAdvice } from '../controllers/agentdailycontroller.js';
import { mealRecommendation } from '../controllers/agentrecommendationcontroller.js';




const router = express.Router();


router.post('/chat',auth ,  chatAgent);
router.get('/daily-advice' , auth , dailyAdvice);
router.post('/recommendation',auth , mealRecommendation);


export default router;
