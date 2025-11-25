import express from 'express';
import { createHabit, getHabitsWithStreak, getHabitwithStreakById,getBestStreak,deleteHabit, lostStreak } from '../controllers/habitController.js';   
import  {authMiddleware } from "../Middleware/auth.js"
const router = express.Router();

router.get('/show',authMiddleware, getHabitsWithStreak);
router.get("/show/:id",authMiddleware, getHabitwithStreakById);
router.get("/beststreak/:id",authMiddleware, getBestStreak);
router.post('/create', authMiddleware, createHabit);
router.patch('/lost/:id', authMiddleware, lostStreak);
router.delete('/delete/:id',authMiddleware, deleteHabit);


export default router;