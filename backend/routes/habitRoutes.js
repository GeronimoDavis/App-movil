import express from 'express';
import { createHabit, getHabitsWithStreak } from '../controllers/habitController.js';   

const router = express.Router();

router.get('/show', getHabitsWithStreak);
router.post('/create', createHabit);

export default router;