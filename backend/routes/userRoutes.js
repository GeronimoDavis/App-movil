import express from "express"
import {userRegister, userLogin, logout, refreshToken} from "../controllers/userController.js"

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/refreshToken", refreshToken)
router.post("/logout", logout);


export default router;