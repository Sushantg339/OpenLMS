import express from "express"

import { loginController, logoutController, refreshAccessToken, signupController } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authLimiter, loginLimiter, signupLimiter } from './../../../middlewares/rateLimiter.middleware.js';

const authRouter = express.Router()

authRouter.post('/signup', signupLimiter, signupController)
authRouter.post('/login', loginLimiter, loginController)
authRouter.post('/refresh', authLimiter, refreshAccessToken)
authRouter.post('/logout', authMiddleware, logoutController)

export default authRouter