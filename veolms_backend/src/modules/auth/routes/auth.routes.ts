import express from "express"

import { loginController, logoutController, refreshAccessToken, signupController } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authLimiter } from './../../../middlewares/rateLimiter.middleware.js';

const authRouter = express.Router()

authRouter.post('/signup', authLimiter, signupController)
authRouter.post('/login', authLimiter, loginController)
authRouter.post('/refresh', authLimiter, refreshAccessToken)
authRouter.post('/logout', authMiddleware, logoutController)

export default authRouter