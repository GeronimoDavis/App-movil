import express from 'express';
import { createHabit, getHabitsWithStreak, getHabitwithStreakById,getBestStreak,deleteHabit, lostStreak } from '../controllers/habitController.js';   

const router = express.Router();

router.get('/show', getHabitsWithStreak);
router.get("/show/:id", getHabitwithStreakById);
router.get("/beststreak/:id", getBestStreak);
router.post('/create', createHabit);
router.patch('/lost/:id', lostStreak);
router.delete('/delete/:id', deleteHabit);


export default router;