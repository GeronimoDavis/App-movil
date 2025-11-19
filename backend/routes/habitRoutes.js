import express from 'express';
import { createHabit, getHabitsWithStreak, getHabitwithStreakById } from '../controllers/habitController.js';   

const router = express.Router();

router.get('/show', getHabitsWithStreak);
router.get("/show/:id", getHabitwithStreakById);
router.post('/create', createHabit);


export default router;